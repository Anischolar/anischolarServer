require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/deposit", async (req, res) => {
  const { amount, account, provider } = req.body;

  if (!amount || !account || !provider) {
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
        <Narrative>Deposit for Order</Narrative>
      </Request>
    </AutoCreate>`;

  try {
    const response = await fetch("https://sandbox.yo.co.ug/services/yopaymentsdev/task.php", {
      method: "POST",
      headers: {
        "Content-Type": "text/xml",
        "Content-Transfer-Encoding": "text",
      },
      body: xmlRequest,
    });

    const textResponse = await response.text();
    res.status(200).send(textResponse);
  } catch (error) {
    console.error("Error processing deposit:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
