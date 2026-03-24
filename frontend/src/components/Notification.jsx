const errorStyle = {
  color: "red",
  background: "lightgrey",
  fontSize: 20,
  borderStyle: "solid",
  borderRadius: 5,
  padding: 10,
  marginBottom: 10,
};

const successStyle = {
  color: "green",
  background: "lightgrey",
  fontSize: 20,
  borderStyle: "solid",
  borderRadius: 5,
  padding: 10,
  marginBottom: 10,
};

const Notification = ({ message, isError }) => {
  if (message === null || message === undefined) {
    return null;
  }

  return <div style={isError ? errorStyle : successStyle}>{message}</div>;
};

export default Notification;
