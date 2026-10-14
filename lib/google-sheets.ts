import { google, sheets_v4 } from "googleapis";
import type { OrderRecord } from "@/lib/order-schema";

export const SHEET_HEADERS = [
  "Order ID",
  "Date & Time",
  "Customer Name",
  "Phone Number",
  "Email Address",
  "Exact Location",
  "Product Name",
  "Quantity",
  "Price Per Piece",
  "Total Price",
  "Payment Method",
  "Order Status",
  "Notes",
] as const;

type NotificationState = "pending" | "business-sent" | "complete";

type StoredOrder = {
  rowNumber: number;
  notificationState: NotificationState;
};

function required(name: string) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required server environment variable: ${name}`);
  }
  return value;
}

function tabRange(tabName: string, range: string) {
  return `'${tabName.replaceAll("'", "''")}'!${range}`;
}

function notificationStateFromNotes(notes = ""): NotificationState {
  if (notes === "Notification status: pending") return "pending";
  if (notes === "Notification status: business email sent") return "business-sent";
  return "complete";
}

async function getClient() {
  const sheetId = required("GOOGLE_SHEET_ID");
  const tabName = required("GOOGLE_SHEET_TAB_NAME");
  const email = required("GOOGLE_SERVICE_ACCOUNT_EMAIL");
  const privateKey = required("GOOGLE_PRIVATE_KEY").replace(/\\n/g, "\n");

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: email,
      private_key: privateKey,
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  return {
    sheetId,
    tabName,
    sheets: google.sheets({ version: "v4", auth }),
  };
}

async function ensureHeaders(
  sheets: sheets_v4.Sheets,
  sheetId: string,
  tabName: string,
) {
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: tabRange(tabName, "A1:M1"),
  });

  const existing = response.data.values?.[0] ?? [];
  if (existing.length === 0) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: tabRange(tabName, "A1:M1"),
      valueInputOption: "RAW",
      requestBody: { values: [[...SHEET_HEADERS]] },
    });
    await formatNewOrderSheet(sheets, sheetId, tabName);
    return;
  }

  const matches = SHEET_HEADERS.every((header, index) => existing[index] === header);
  if (!matches) {
    throw new Error(
      "The Google Sheet header row does not match the required order columns. Check the README setup section.",
    );
  }
}

async function formatNewOrderSheet(
  sheets: sheets_v4.Sheets,
  spreadsheetId: string,
  tabName: string,
) {
  const spreadsheet = await sheets.spreadsheets.get({
    spreadsheetId,
    fields: "sheets.properties",
  });
  const sheet = spreadsheet.data.sheets?.find(
    (item) => item.properties?.title === tabName,
  );
  const numericSheetId = sheet?.properties?.sheetId;
  if (numericSheetId === undefined || numericSheetId === null) {
    throw new Error(`Google Sheet tab \"${tabName}\" was not found.`);
  }

  const statusValues = [
    "New Order",
    "Order Confirmed",
    "Order Ongoing",
    "Delivered",
    "Cancelled",
  ].map((userEnteredValue) => ({ userEnteredValue }));

  const brandColor = { red: 0.498, green: 0.141, blue: 0.275 };
  const brandDark = { red: 0.31, green: 0.075, blue: 0.16 };
  const gold = { red: 0.722, green: 0.537, blue: 0.271 };
  const requests: sheets_v4.Schema$Request[] = [
    {
      updateSheetProperties: {
        properties: {
          sheetId: numericSheetId,
          tabColorStyle: { rgbColor: brandColor },
          gridProperties: {
            frozenRowCount: 1,
            frozenColumnCount: 2,
            hideGridlines: true,
          },
        },
        fields:
          "tabColorStyle,gridProperties.frozenRowCount,gridProperties.frozenColumnCount,gridProperties.hideGridlines",
      },
    },
    {
      updateDimensionProperties: {
        range: {
          sheetId: numericSheetId,
          dimension: "ROWS",
          startIndex: 0,
          endIndex: 1,
        },
        properties: { pixelSize: 46 },
        fields: "pixelSize",
      },
    },
    {
      updateDimensionProperties: {
        range: {
          sheetId: numericSheetId,
          dimension: "ROWS",
          startIndex: 1,
          endIndex: 1000,
        },
        properties: { pixelSize: 38 },
        fields: "pixelSize",
      },
    },
    {
      repeatCell: {
        range: {
          sheetId: numericSheetId,
          startRowIndex: 0,
          endRowIndex: 1000,
          startColumnIndex: 0,
          endColumnIndex: SHEET_HEADERS.length,
        },
        cell: {
          userEnteredFormat: {
            textFormat: {
              foregroundColor: { red: 0.16, green: 0.12, blue: 0.14 },
              fontFamily: "Arial",
              fontSize: 10,
            },
            verticalAlignment: "MIDDLE",
          },
        },
        fields: "userEnteredFormat(textFormat,verticalAlignment)",
      },
    },
    {
      repeatCell: {
        range: {
          sheetId: numericSheetId,
          startRowIndex: 0,
          endRowIndex: 1,
          startColumnIndex: 0,
          endColumnIndex: SHEET_HEADERS.length,
        },
        cell: {
          userEnteredFormat: {
            backgroundColor: brandColor,
            textFormat: {
              foregroundColor: { red: 1, green: 1, blue: 1 },
              bold: true,
              fontFamily: "Arial",
              fontSize: 10,
            },
            horizontalAlignment: "CENTER",
            verticalAlignment: "MIDDLE",
            wrapStrategy: "WRAP",
            borders: {
              bottom: { style: "SOLID_MEDIUM", color: gold },
            },
          },
        },
        fields:
          "userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment,wrapStrategy,borders)",
      },
    },
    {
      repeatCell: {
        range: {
          sheetId: numericSheetId,
          startRowIndex: 1,
          endRowIndex: 1000,
          startColumnIndex: 0,
          endColumnIndex: SHEET_HEADERS.length,
        },
        cell: {
          userEnteredFormat: {
            borders: {
              bottom: {
                style: "SOLID",
                color: { red: 0.91, green: 0.87, blue: 0.89 },
              },
            },
          },
        },
        fields: "userEnteredFormat.borders",
      },
    },
    {
      repeatCell: {
        range: {
          sheetId: numericSheetId,
          startRowIndex: 1,
          endRowIndex: 1000,
          startColumnIndex: 0,
          endColumnIndex: 2,
        },
        cell: {
          userEnteredFormat: { horizontalAlignment: "CENTER" },
        },
        fields: "userEnteredFormat.horizontalAlignment",
      },
    },
    {
      repeatCell: {
        range: {
          sheetId: numericSheetId,
          startRowIndex: 1,
          endRowIndex: 1000,
          startColumnIndex: 5,
          endColumnIndex: 7,
        },
        cell: {
          userEnteredFormat: {
            wrapStrategy: "WRAP",
            verticalAlignment: "MIDDLE",
          },
        },
        fields: "userEnteredFormat(wrapStrategy,verticalAlignment)",
      },
    },
    {
      repeatCell: {
        range: {
          sheetId: numericSheetId,
          startRowIndex: 1,
          endRowIndex: 1000,
          startColumnIndex: 7,
          endColumnIndex: 8,
        },
        cell: {
          userEnteredFormat: {
            horizontalAlignment: "CENTER",
            numberFormat: { type: "NUMBER", pattern: "0" },
          },
        },
        fields:
          "userEnteredFormat(horizontalAlignment,numberFormat)",
      },
    },
    {
      repeatCell: {
        range: {
          sheetId: numericSheetId,
          startRowIndex: 1,
          endRowIndex: 1000,
          startColumnIndex: 8,
          endColumnIndex: 10,
        },
        cell: {
          userEnteredFormat: {
            horizontalAlignment: "RIGHT",
            numberFormat: { type: "CURRENCY", pattern: '"NPR" #,##0' },
          },
        },
        fields:
          "userEnteredFormat(horizontalAlignment,numberFormat)",
      },
    },
    {
      repeatCell: {
        range: {
          sheetId: numericSheetId,
          startRowIndex: 1,
          endRowIndex: 1000,
          startColumnIndex: 10,
          endColumnIndex: 12,
        },
        cell: {
          userEnteredFormat: { horizontalAlignment: "CENTER" },
        },
        fields: "userEnteredFormat.horizontalAlignment",
      },
    },
    {
      addBanding: {
        bandedRange: {
          range: {
            sheetId: numericSheetId,
            startRowIndex: 0,
            endRowIndex: 1000,
            startColumnIndex: 0,
            endColumnIndex: SHEET_HEADERS.length,
          },
          rowProperties: {
            headerColor: brandColor,
            firstBandColor: { red: 1, green: 1, blue: 1 },
            secondBandColor: { red: 0.984, green: 0.957, blue: 0.965 },
          },
        },
      },
    },
    {
      setBasicFilter: {
        filter: {
          range: {
            sheetId: numericSheetId,
            startRowIndex: 0,
            startColumnIndex: 0,
            endColumnIndex: SHEET_HEADERS.length,
          },
        },
      },
    },
    {
      setDataValidation: {
        range: {
          sheetId: numericSheetId,
          startRowIndex: 1,
          endRowIndex: 1000,
          startColumnIndex: 11,
          endColumnIndex: 12,
        },
        rule: {
          condition: { type: "ONE_OF_LIST", values: statusValues },
          strict: true,
          showCustomUi: true,
        },
      },
    },
  ];

  const columnWidths = [
    176, 176, 168, 132, 220, 280, 228, 92, 132, 132, 156, 150, 210,
  ];
  columnWidths.forEach((pixelSize, index) => {
    requests.push({
      updateDimensionProperties: {
        range: {
          sheetId: numericSheetId,
          dimension: "COLUMNS",
          startIndex: index,
          endIndex: index + 1,
        },
        properties: { pixelSize },
        fields: "pixelSize",
      },
    });
  });

  const statusStyles = [
    {
      value: "New Order",
      backgroundColor: { red: 0.984, green: 0.89, blue: 0.925 },
      foregroundColor: brandDark,
    },
    {
      value: "Order Confirmed",
      backgroundColor: { red: 0.87, green: 0.925, blue: 0.984 },
      foregroundColor: { red: 0.12, green: 0.31, blue: 0.5 },
    },
    {
      value: "Order Ongoing",
      backgroundColor: { red: 1, green: 0.945, blue: 0.78 },
      foregroundColor: { red: 0.42, green: 0.29, blue: 0.05 },
    },
    {
      value: "Delivered",
      backgroundColor: { red: 0.86, green: 0.95, blue: 0.88 },
      foregroundColor: { red: 0.12, green: 0.34, blue: 0.19 },
    },
    {
      value: "Cancelled",
      backgroundColor: { red: 0.984, green: 0.87, blue: 0.87 },
      foregroundColor: { red: 0.55, green: 0.08, blue: 0.08 },
    },
  ];
  statusStyles.forEach(({ value, backgroundColor, foregroundColor }) => {
    requests.push({
      addConditionalFormatRule: {
        index: 0,
        rule: {
          ranges: [
            {
              sheetId: numericSheetId,
              startRowIndex: 1,
              endRowIndex: 1000,
              startColumnIndex: 11,
              endColumnIndex: 12,
            },
          ],
          booleanRule: {
            condition: {
              type: "CUSTOM_FORMULA",
              values: [{ userEnteredValue: `=$L2="${value}"` }],
            },
            format: {
              backgroundColor,
              textFormat: { bold: true, foregroundColor },
            },
          },
        },
      },
    });
  });

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: { requests },
  });
}

async function findStoredOrder(
  sheets: sheets_v4.Sheets,
  sheetId: string,
  tabName: string,
  orderId: string,
): Promise<StoredOrder | null> {
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: tabRange(tabName, "A2:M"),
  });

  const rows = response.data.values ?? [];
  const index = rows.findIndex((row) => row[0] === orderId);
  if (index === -1) return null;

  return {
    rowNumber: index + 2,
    notificationState: notificationStateFromNotes(rows[index][12]),
  };
}

export async function saveOrder(order: OrderRecord): Promise<StoredOrder> {
  const { sheets, sheetId, tabName } = await getClient();
  await ensureHeaders(sheets, sheetId, tabName);

  const existing = await findStoredOrder(
    sheets,
    sheetId,
    tabName,
    order.orderId,
  );
  if (existing) return existing;

  const response = await sheets.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range: tabRange(tabName, "A:M"),
    valueInputOption: "RAW",
    insertDataOption: "OVERWRITE",
    requestBody: {
      values: [
        [
          order.orderId,
          order.dateTime,
          order.fullName,
          order.phone,
          order.email,
          order.location,
          order.productName,
          order.quantity,
          order.pricePerPiece,
          order.totalPrice,
          order.paymentMethod,
          order.orderStatus,
          "Notification status: pending",
        ],
      ],
    },
  });

  const updatedRange = response.data.updates?.updatedRange ?? "";
  const rowNumber = Number(updatedRange.match(/!A(\d+):/)?.[1]);
  if (!rowNumber) {
    const stored = await findStoredOrder(
      sheets,
      sheetId,
      tabName,
      order.orderId,
    );
    if (!stored) throw new Error("Order was written but could not be verified.");
    return stored;
  }

  return { rowNumber, notificationState: "pending" };
}

export async function updateNotificationState(
  rowNumber: number,
  state: Exclude<NotificationState, "pending">,
) {
  const { sheets, sheetId, tabName } = await getClient();
  const value =
    state === "business-sent"
      ? "Notification status: business email sent"
      : "";

  await sheets.spreadsheets.values.update({
    spreadsheetId: sheetId,
    range: tabRange(tabName, `M${rowNumber}`),
    valueInputOption: "RAW",
    requestBody: { values: [[value]] },
  });
}
