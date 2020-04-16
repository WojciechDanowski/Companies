import React from "react";
import "./Pager.css";

export default ({ pageCount, pageIndex, onPageChange }) => {
  return (
    <ul style={{ listStyleType: "none", display: "flex" }}>
      {pageIndex > 0 && (
        <li
          className="pagingItem"
          onClick={() => {
            onPageChange(pageIndex - 1);
          }}
        >
          &#8592;
        </li>
      )}
      {Array(pageCount)
        .fill(null)
        .map((_, index) => {
          return (
            <li
              key={index}
              className={`pagingItem ${pageIndex === index ? "active" : ""}`}
              onClick={() => {
                onPageChange(index);
              }}
            >
              {index + 1}
            </li>
          );
        })}
      {pageIndex < pageCount - 1 && (
        <li
          className="pagingItem"
          onClick={() => {
            onPageChange(pageIndex + 1);
          }}
        >
          &#8594;
        </li>
      )}
    </ul>
  );
};
