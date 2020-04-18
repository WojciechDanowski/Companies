import React, { Component } from "react";
import Pager from "./Pager";
const pageSizes = [10, 20, 30];
const incomeDataKeys = ["total_income", "average_income", "last_month_income"];

const sortNumeric = (a, b) => {
  if (a === b) {
    return 0;
  }
  if (Number(a) > Number(b)) {
    return 1;
  }
  return -1;
};

const sortString = (a, b) => {
  if (a === b) {
    return 0;
  }
  if (a > b) {
    return 1;
  }
  return -1;
};

const columnDefinitions = [
  {
    key: "id",
    sort: sortNumeric,
  },
  { key: "name", sort: sortString },
  { key: "city", sort: sortString },
  { key: "total_income", sort: sortNumeric },
  { key: "average_income", sort: sortNumeric },
  { key: "last_month_income", sort: sortNumeric },
];
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
    sorters: [],
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

  getSortedRowData = () => {
    const { sorters, rowData } = this.state;
    let sortedRowData = [...rowData];

    for (const sorter of sorters) {
      const { sort } = columnDefinitions.find(
        (definition) => definition.key === sorter.key
      );
      if (sorter.direction === "asc") {
        sortedRowData.sort((a, b) => sort(a[sorter.key], b[sorter.key]));
      } else {
        sortedRowData = sortedRowData
          .reverse()
          .sort((a, b) => sort(a[sorter.key], b[sorter.key]))
          .reverse();
      }
    }

    return sortedRowData;
  };

  getVisibleRows = () => {
    const { pageSize, pageNumber } = this.state;
    const sortedRowData = this.getSortedRowData();
    const itemOffset = pageNumber * pageSize;
    const visibleRows = sortedRowData.slice(itemOffset, itemOffset + pageSize);

    return visibleRows;
  };

  componentDidUpdate(prevProps, prevState) {
    const {
      pageSize: prevPageSize,
      pageNumber: prevPageNumber,
      rowData: prevRowData,
      sorters: prevSorters,
    } = prevState;
    const { pageSize, pageNumber, rowData, sorters } = this.state;

    if (
      prevSorters !== sorters ||
      prevPageSize !== pageSize ||
      prevPageNumber !== pageNumber ||
      prevRowData.length !== rowData.length
    ) {
      this.fetchIncomeDataForVisibleRows();
    }
  }

  getColumns = () => {
    const { sorters, columns } = this.state;
    let resultColumns = [];

    for (const column of columns) {
      const sorter = sorters.find((sorter) => sorter.key === column);
      const resultColumn = sorter
        ? { key: column, direction: sorter.direction }
        : { key: column };
      resultColumns = [...resultColumns, resultColumn];
    }

    return resultColumns;
  };
  onColumnHeaderClick = (column) => {
    const { sorters } = this.state;
    const sorter = sorters.find((sorter) => sorter.key === column.key);
    if (!sorter) {
      this.setState(({ sorters, ...rest }) => ({
        ...rest,
        sorters: [...sorters, { key: column.key, direction: "asc" }],
      }));
      return;
    }
    sorter.direction = sorter.direction === "asc" ? "desc" : "asc";
    this.setState({
      sorters: [...sorters],
    });
  };

  getDirectionLabel = (direction) => {
    if (direction === "asc") {
      return "🔻";
    }
    if (direction === "desc") {
      return "🔺";
    }
    return "";
  };

  getHeaderElement = (column) => {
    const { key, direction } = column;
    return (
      <th
        onClick={() => this.onColumnHeaderClick(column)}
        key={key}
      >{`${key} ${this.getDirectionLabel(direction)} `}</th>
    );
  };

  render() {
    const { pageSize, pageNumber, rowData } = this.state;
    const columns = this.getColumns();
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
            <tr>{columns.map(this.getHeaderElement)}</tr>
          </thead>
          <tbody>
            {visibleRows.map((item) => {
              return (
                <tr key={item.id}>
                  {columns.map(({ key }) => {
                    return (
                      <td key={key}>{this.getValueElement(key, item)} </td>
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
