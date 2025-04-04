require("dotenv").config();
const express = require("express");
const crypto = require("crypto");
const cors = require("cors");
const fetch = require("node-fetch");
const { log } = require("console");

const app = express();
app.use(cors());
app.use(express.json());

const transactions = {};

app.post("/api/deposit", async (req, res) => {
  const { amount, account, provider, narrative } = req.body;
  const InstantNotificationUrl = "https://3d79-41-210-155-61.ngrok-free.app/api/notification";
  const FailureNotificationUrl = "https://3d79-41-210-155-61.ngrok-free.app/api/failurenotification";
  const ExternalReference = "1234567890";

  if (!amount || !account || !provider || !narrative) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const xmlRequest = `<?xml version="1.0" encoding="UTF-8"?>
    <AutoCreate>
      <Request>
        <APIUsername>${process.env.YO_USERNAME}</APIUsername>
        <APIPassword>${process.env.YO_PASSWORD}</APIPassword>
        <Method>acdepositfunds</Method>
        <Amount>${amount}</Amount>
        <Account>${account}</Account>
        <AccountProviderCode>${provider}</AccountProviderCode>
        <Narrative>${narrative}</Narrative>
        <ExternalReference>${ExternalReference}</ExternalReference>
        <InstantNotificationUrl>${InstantNotificationUrl}</InstantNotificationUrl>
        <FailureNotificationUrl>${FailureNotificationUrl}</FailureNotificationUrl>
      </Request>
    </AutoCreate>`;
  // https://3d79-41-210-155-61.ngrok-free.app/api/notification/
  try {
    console.log(xmlRequest);
    
    // https://paymentsapi1.yo.co.ug/ybs/task.php
    // https://sandbox.yo.co.ug/services/yopaymentsdev/task.php
    const response = await fetch("https://paymentsapi1.yo.co.ug/ybs/task.php", {
      method: "POST",
      headers: {
        "Content-Type": "text/xml",
        "Content-Transfer-Encoding": "text",
      },
      body: xmlRequest,
    });

    const textResponse = await response.text();
    console.log(textResponse);

    res.status(200).send(textResponse);
  } catch (error) {
    console.error("Error processing deposit:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// IPN Handler
app.post('/api/notification', (req, res) => {

  try {
    console.log(req.headers);

    const publicCert = process.env.YO_PUBLIC_CERT;
    // const signature = req.headers['x-yo-ipn-signature'];
    const body = req.body;
    // const hash = crypto.createVerify('SHA256');
    // hash.update(JSON.stringify(body));
    // const isValid = hash.verify(publicCert, signature, 'base64');
    // console.log(isValid);
    console.log(body);
    res.status(200).send('OK');


  } catch (error) {
    console.error("Error processing notification:", error);
    res.status(500).json({ error: "Internal Server Error" });


  }
});

app.post("/api/failurenotification", (req, res) => {
  console.log(req.body);
  res.status(200).send("OK");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
