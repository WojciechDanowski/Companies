import React, { Component } from "react";
import Pager from "./Pager";
const pageSizes = [10, 20, 30];
const incomeDataKeys = ["total_income", "average_income", "last_month_income"];

class CompaniesTable extends Component {
  state = {
    columns: [
      "id",
      "name",
      "city",
      "total_income",
      "average_income",
      "last_month_income",
    ],
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
      pageNumber: 0,
      pageSize: value,
    });

  onPageChange = (newPageIndex) => {
    this.setState({
      pageNumber: newPageIndex,
    });
  };

  getValueElement = (column, data) => {
    return data[column] || "...";
  };

  fetchIncomeDataForVisibleRows = () => {
    const visibleRows = this.getVisibleRows();
    const itemsWithoutIncomeData = visibleRows.filter((row) => {
      for (const incomeDataKey of incomeDataKeys) {
        if (row[incomeDataKey] === undefined) {
          return true;
        }
      }
      return false;
    });

    const fetchPromises = itemsWithoutIncomeData.map(({ id, ...rest }) => {
      return fetch(`https://recruitment.hal.skygate.io/incomes/${id}`)
        .then((response) => response.json())
        .then((incomeData) => {
          let sum = 0;
          const { incomes } = incomeData;
          incomes.map((item) => {
            sum = parseFloat((sum + parseFloat(item.value)).toFixed(2));
          });
          const average = sum / incomes.length;
          console.log(average);
        });
    });
    Promise.all(fetchPromises);
  };

  getVisibleRows = () => {
    const { pageSize, pageNumber, columns, rowData } = this.state;
    const itemOffset = pageNumber * pageSize;
    const visibleRows = rowData.slice(itemOffset, itemOffset + pageSize);
    return visibleRows;
  };

  componentDidUpdate(prevProps, prevState) {
    const { pageSize: prevPageSize, pageNumber: prevPageNumber } = prevState;
    const { pageSize, pageNumber } = this.state;
    if (prevPageSize !== pageSizes || prevPageNumber !== pageNumber) {
      this.fetchIncomeDataForVisibleRows();
    }
  }

  render() {
    const { pageSize, pageNumber, columns, rowData } = this.state;

    const visibleRows = this.getVisibleRows();

    const pageCount = Math.ceil(rowData.length / pageSize);

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
        <Pager
          pageCount={pageCount}
          pageIndex={pageNumber}
          onPageChange={this.onPageChange}
        />
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
                  {columns.map((column) => {
                    return (
                      <td key={column}>
                        {this.getValueElement(column, item)}{" "}
                      </td>
                    );
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
