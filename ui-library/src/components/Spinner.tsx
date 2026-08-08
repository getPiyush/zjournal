export const Spinner = () => {
  return (
    <div
      className="justify-content-center"
      style={{
        marginTop: "70px",
        padding: "8px",
        float: "right",
        backgroundColor: "#9fa3a7",
        color: "white"
      }}
    >
      <div
        className="spinner-border spinner-border-sm"
        role="status"
      >
        <span className="sr-only"></span>
      </div>
      &nbsp; <b>Getting content..</b>
    </div>
  );
};
