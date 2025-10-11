// currency_converter.js
import https from "https";
import readline from "readline";
import chalk from "chalk";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// 🗝️ Replace with your real key from https://www.exchangerate-api.com
const apiKey = "e04806dfc6c6e868493c12aa"; // ✅ no spaces!
const url = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`;

// 💰 Function to convert the amount
const convertCurrency = (amount, rate) => (amount * rate).toFixed(2);

// 🌐 Request exchange rates
https
  .get(url, (response) => {
    let data = "";

    response.on("data", (chunk) => {
      data += chunk;
    });

    response.on("end", () => {
      // Debug: print the first few characters to check what we got
      if (data.trim().startsWith("<")) {
        console.error(chalk.red.bold("❌ Received HTML instead of JSON!"));
        console.log(chalk.yellow("➡️  Check your API key or URL:"));
        console.log(chalk.cyan(url));
        rl.close();
        return;
      }

      try {
        const jsonData = JSON.parse(data);

        // Check API response status
        if (jsonData.result !== "success") {
          console.error(
            chalk.red.bold(`❌ API Error: ${jsonData["error-type"] || "Unknown error"}`)
          );
          rl.close();
          return;
        }

        const rates = jsonData.conversion_rates;

        // Ask user for input
        rl.question("Enter the amount in USD: ", (amount) => {
          rl.question(
            "Enter the target currency (e.g., INR, EUR, NPR): ",
            (currency) => {
              const code = currency.toUpperCase();
              const rate = rates[code];

              if (rate) {
                console.log(
                  chalk.blue.bgRed.bold(
                    `${amount} USD is approximately ${convertCurrency(
                      amount,
                      rate
                    )} ${code}`
                  )
                );
              } else {
                console.log(chalk.red.bold("❌ Invalid Currency Code"));
              }

              rl.close();
            }
          );
        });
      } catch (error) {
        console.error(chalk.red("❌ Error parsing data:"), error.message);
        console.log(chalk.yellow("Tip: Your API key may be invalid or expired."));
        rl.close();
      }
    });
  })
  .on("error", (err) => {
    console.error(chalk.red("❌ Request failed:"), err.message);
  });
