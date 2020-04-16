import React, { Component } from "react";
import Pager from "./Pager";
const pageSizes = [10, 20, 30];

class CompaniesTable extends Component {
  state = {
    columns: ["id", "name", "city"],
    rowData: [],
    pageSize: 10,
    pageNumber: 0,
  };

  componentDidMount() {
    fetch("https://recruitment.hal.skygate.io/companies")
      .then((response) => response.json())
      .then((result) => {
        this.setState({
          rowData: result,
        });
      })
      .catch((err) => console.log(err));
  }

  handlePageSizeChange = ({ target: { value } }) =>
    this.setState({
      pageSize: value,
    });

  render() {
    const { pageSize, pageNumber, columns, rowData } = this.state;

    const itemOffset = pageNumber * pageSize;
    const visibleRows = rowData.slice(itemOffset, itemOffset + pageSize);

    return (
      <>
        <label>
          Page size:
          <select onChange={this.handlePageSizeChange} value={pageSize}>
            {pageSizes.map((size) => {
              return (
                <option key={size} value={size}>
                  {size}
                </option>
              );
            })}
          </select>
        </label>
        <Pager />
        <table>
          <thead>
            <tr>
              {columns.map((item) => {
                return <th key={item}> {item} </th>;
              })}
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((item) => {
              return (
                <tr key={item.id}>
                  {columns.map((name) => {
                    return <td key={name}>{item[name]} </td>;
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </>
    );
  }
}

export default CompaniesTable;
