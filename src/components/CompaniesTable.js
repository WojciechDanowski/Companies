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
      pageSize: parseInt(value, 10),
    });

  onPageChange = (newPageIndex) => {
    this.setState({
      pageNumber: newPageIndex,
    });
  };

  getValueElement = (column, data) => {
    const value = data[column];
    if (value === undefined) {
      return "-";
    }
    return value;
  };

  fetchIncomeDataForVisibleRows = () => {
    const visibleRows = this.getVisibleRows();
    const itemsWithoutIncomeData = visibleRows.filter((row) => {
      if (row._fetched) {
        return false;
      }
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
          let previousMonthSum = 0;
          const { incomes } = incomeData;
          incomes.forEach((item) => {
            sum = parseFloat((sum + parseFloat(item.value)).toFixed(2));
          });
          const average = (sum / incomes.length).toFixed(2);

          const currentYear = new Date().getFullYear();
          const currentMonth = new Date().getMonth();
          const searchYear = currentMonth === 0 ? currentYear - 1 : currentYear;
          const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
          const previousMonthIncomes = incomes.filter(({ date }) => {
            const currentDate = new Date(date);
            const currentDateYear = currentDate.getFullYear();
            const currentDateMonth = currentDate.getMonth();

            return (
              currentDateYear === searchYear &&
              currentDateMonth === previousMonth
            );
          });
          previousMonthIncomes.forEach((income) => {
            previousMonthSum = parseFloat(
              (previousMonthSum + parseFloat(income.value)).toFixed(2)
            );
          });
          return {
            id,
            ...rest,
            total_income: sum,
            average_income: average,
            last_month_income: previousMonthSum,
            _fetched: true,
          };
        });
    });

    Promise.all(fetchPromises).then((fullVisibleRows) => {
      this.setState((prevState) => {
        const findbyId = (id) => {
          return prevState.rowData.find((row) => row.id === id);
        };
        for (const visibleRow of fullVisibleRows) {
          const item = findbyId(visibleRow.id);

          Object.assign(item, visibleRow);
        }
        return { ...prevState, rowData: [...prevState.rowData] };
      });
    });
  };

  getVisibleRows = () => {
    const { pageSize, pageNumber, columns, rowData } = this.state;
    const itemOffset = pageNumber * pageSize;
    const visibleRows = rowData.slice(itemOffset, itemOffset + pageSize);

    return visibleRows;
  };

  componentDidUpdate(prevProps, prevState) {
    const {
      pageSize: prevPageSize,
      pageNumber: prevPageNumber,
      rowData: prevRowData,
    } = prevState;
    const { pageSize, pageNumber, rowData } = this.state;
    if (
      prevPageSize !== pageSize ||
      prevPageNumber !== pageNumber ||
      prevRowData.length !== rowData.length
    ) {
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
