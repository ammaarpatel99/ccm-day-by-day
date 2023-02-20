const ramadanStartDate = new Date("2023-03-23");
const last10Days = new Date(ramadanStartDate.getTime());
last10Days.setDate(last10Days.getDay() + 20);

export const SETTINGS = {
  ramadanStartDate, last10Days,
};
