import React from "react";

export default ({ pageCount, pageIndex, onPageChange }) => {
  return (
    <ul style={{ listStyleType: "none", display: "flex" }}>
      <li>&#8592;</li>
      <li>&#8594;</li>
    </ul>
  );
};
