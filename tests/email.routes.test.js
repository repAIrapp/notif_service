const request = require("supertest");

// On mock nodemailer AVANT d'importer l'app
jest.mock("nodemailer", () => {
  const sendMail = jest.fn();
  return {
    __esModule: false,
    createTransport: jest.fn(() => ({ sendMail })),
    // expose la mock pour la manipuler dans les tests
    __mocks__: { sendMail },
  };
});

const nodemailer = require("nodemailer");
const { app } = require("../app");

describe("Notification service - /api/email", () => {
  beforeEach(() => {
    // reset mock
    nodemailer.createTransport().__proto__.sendMail?.mockReset?.();
    if (nodemailer.__mocks__?.sendMail) nodemailer.__mocks__.sendMail.mockReset();
  });

  test("POST /api/email/confirmation -> 200 et sendMail appelé", async () => {
    const sendMailMock =
      nodemailer.__mocks__?.sendMail || nodemailer.createTransport().sendMail;
    sendMailMock.mockResolvedValueOnce({ messageId: "abc-123" });

   const body = {
  email: "user@test.com",
  confirmationLink: "https://example.com/verify?token=xyz",
};

    const res = await request(app)
      .post("/api/email/confirmation")
      .send(body)
      .set("Content-Type", "application/json");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: "Email de confirmation envoyé." });
    expect(sendMailMock).toHaveBeenCalledTimes(1);
    const mailArg = sendMailMock.mock.calls[0][0];
    expect(mailArg.to).toBe(body.email);
    expect(mailArg.html).toContain(body.confirmationLink);
  });

  test("POST /api/email/confirmation -> 400 si champs invalides", async () => {
    const res = await request(app)
      .post("/api/email/confirmation")
      .send({ email: "user@test.com" }); // confirmationLink manquant

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("errors");
    expect(Array.isArray(res.body.errors)).toBe(true);
    expect(res.body.errors.length).toBeGreaterThan(0);

    const errorMessages = res.body.errors.map(e => e.msg);
    expect(errorMessages).toContain("Invalid value");
  });

  test("POST /api/email/confirmation -> 500 si sendMail échoue", async () => {
    const sendMailMock =
      nodemailer.__mocks__?.sendMail || nodemailer.createTransport().sendMail;
    sendMailMock.mockRejectedValueOnce(new Error("SMTP down"));

    const res = await request(app)
      .post("/api/email/confirmation")
      .send({
        email: "user@test.com",
        confirmationLink: "https://example.com/verify?token=fail",

      });

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: "Échec de l’envoi de l’email." });
  });

  test("POST /api/email/confirmation -> 429 si trop de requêtes", async () => {
    const body = {
      email: "user@test.com",
      confirmationLink: "http://localhost:3000/verify?token=xyz",
    };

    const sendMailMock =
      nodemailer.__mocks__?.sendMail || nodemailer.createTransport().sendMail;
    sendMailMock.mockResolvedValue({ messageId: "xyz" });

    // Envoi 6 fois la même requête (supposons limite max: 5)
    for (let i = 0; i < 5; i++) {
      await request(app)
        .post("/api/email/confirmation")
        .send(body)
        .set("Content-Type", "application/json");
    }

    const res = await request(app)
      .post("/api/email/confirmation")
      .send(body)
      .set("Content-Type", "application/json");

    expect(res.status).toBe(429);
    expect(res.body).toHaveProperty("error");
  });
});

describe("GET /health", () => {
  test("renvoie {status:'ok'}", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });
});
