import React, { Component } from "react";

class CompaniesTable extends Component {
  state = {
    columns: ["id", "name", "city"],
    rowData: [],
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

  render() {
    const { columns, rowData } = this.state;
    return (
      <table>
        <thead>
          <tr>
            {columns.map((item) => {
              return <th key={item}> {item} </th>;
            })}
          </tr>
        </thead>
        <tbody>
          {rowData.map((item) => {
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
    );
  }
}

export default CompaniesTable;
