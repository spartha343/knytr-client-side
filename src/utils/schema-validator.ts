export const getErrorMessageByPropertyName = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  obj: Record<string, any>,
  propertyPath: string,
) => {
  // let obj = errors
  // let propertyPath = "admin.name.firstName"
  // let propertyPath = "admin.name.lastName"

  const properties = propertyPath.split(".");
  // ["admin","name","firstName"]
  // ["admin","name","lastName"]
  let value = obj;

  for (const prop of properties) {
    if (value[prop]) {
      value = value[prop];
    } else {
      return undefined;
    }
  }

  return value.message;
};
