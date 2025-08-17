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
    // compat: si l'impl ci-dessus ne met pas sendMail sur __proto__ :
    if (nodemailer.__mocks__?.sendMail) nodemailer.__mocks__.sendMail.mockReset();
  });

  test("POST /api/email/confirmation -> 200 et sendMail appelé", async () => {
    // arrange
    const sendMailMock =
      nodemailer.__mocks__?.sendMail || nodemailer.createTransport().sendMail;
    sendMailMock.mockResolvedValueOnce({ messageId: "abc-123" });

    const body = {
      email: "user@test.com",
      confirmationLink: "http://localhost:3000/verify?token=xyz",
    };

    // act
    const res = await request(app)
      .post("/api/email/confirmation")
      .send(body)
      .set("Content-Type", "application/json");

    // assert
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: "Email de confirmation envoyé." });
    expect(sendMailMock).toHaveBeenCalledTimes(1);
    const mailArg = sendMailMock.mock.calls[0][0];
    expect(mailArg.to).toBe(body.email);
    expect(mailArg.html).toContain(body.confirmationLink);
  });

  test("POST /api/email/confirmation -> 400 si champs manquants", async () => {
    const res = await request(app)
      .post("/api/email/confirmation")
      .send({ email: "user@test.com" }); // pas de confirmationLink

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "Email et lien requis." });
  });

  test("POST /api/email/confirmation -> 500 si sendMail échoue", async () => {
    const sendMailMock =
      nodemailer.__mocks__?.sendMail || nodemailer.createTransport().sendMail;
    sendMailMock.mockRejectedValueOnce(new Error("SMTP down"));

    const res = await request(app)
      .post("/api/email/confirmation")
      .send({
        email: "user@test.com",
        confirmationLink: "http://x/verify",
      });

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: "Échec de l’envoi de l’email." });
  });
});

describe("GET /health", () => {
  test("renvoie {status:'ok'}", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });
});
