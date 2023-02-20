import {ActiveSubscription, db} from "./database";

/**
 * Sends email confirming of subscription
 * @param {ActiveSubscription} data
 * @param {string} docID
 */
export async function sendConfirmationEmail(
  data: ActiveSubscription,
  docID: string
) {
  await db.mail.add({
    to: data.email,
    message: {
      subject: "CCM Day By Day 2023 Configured",
      html: "Thank you for setting up your donation to Cambridge Central" +
        " Mosque for Ramadan 2023 through our Day By Day scheme." +
        " The details are below:\n" +
        "\nName: " + data.name +
        "\nAnonymous: " + data.anonymous ? "Yes" : "No" +
        "\nID: " + docID +
        "\nAmount: " + data.amount +
        "\nStart Date: " + data.startDate.toDate().toLocaleDateString() +
        (data.startDate.toDate() > new Date() ? " (estimate)" : "") +
        "\nDays: " + data.iterations +
        "\n\nEmail: " + data.email +
        "\nPhone Number: " + data.phone +
        "\nGift Aid: " + data.giftAid ? "Yes" : "No" +
        "\nID: " + docID +
        "\n\nBest wishes," +
        "\nAdmin Team" +
        "\n<a href='cambridgecentralmosque.org'>" +
        "Cambridge Central Mosque</a>" +
        "\n<a href='mailto:daybyday@cambridgecentralmosque.org'>" +
        "daybyday@cambridgecentralmosque.org</a>",
    },
  });
}
