import React, { useState, useEffect, useRef} from "react";
import axios from "axios";
import "./App.css";

const ALPHABET = "abcdefghijklmnopqrstuvwxyz".split("");
const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];


function App() {
  const [employeesData, setEmployeesData] = useState(JSON.parse(localStorage.getItem('data')) ?? []);
  const [unused, setUnused] = useState([])
  const [checkedEmployees, setCheckedEmployees] = useState(JSON.parse(localStorage.getItem('checkedEmployees')) ?? [])
  let unused_set = new Set();

  const unusedLetters = () => {
    let tmp = []
    for(let i = 0; i < ALPHABET.length; i++) {
      tmp[ALPHABET[i]] = []
      for(let j = 0; j < employeesData.length; j++) {
        if(employeesData[j]['lastName'][0].toLowerCase() === ALPHABET[i]) {
          tmp[ALPHABET[i]].push(employeesData[j])
        }
      }
    }
    let lt = []
    for(let i = 0; i < ALPHABET.length; i++) {
      if (tmp[ALPHABET[i]].length === 0) {
        lt.push(ALPHABET[i])
      }
    }
    setUnused(lt);
  }

  const toggleCheckbox = (e, el)  => {
    let checked = e.target.checked;
    setEmployeesData(
        employeesData.map(person => {
          if(person['id'] === el['id']) {
            person['completed'] = checked;
          }
          return person;
        })
    )
    if(checked) {
      setCheckedEmployees(prev => [...prev, el])
    } else {
      setCheckedEmployees(checkedEmployees.filter(e => e['id'] !== el['id']))
    }
    localStorage.setItem('data', JSON.stringify(employeesData))
  }

  useEffect(() => {
    localStorage.setItem('checkedEmployees', JSON.stringify(checkedEmployees))
  }, [checkedEmployees])

  useEffect(() => {
    axios.get('https://yalantis-react-school-api.yalantis.com/api/task0/users')
        .then(res => {
          let data = JSON.parse(localStorage.getItem('data')) ?? []
          if(res.data.length !== data.length) {
            localStorage.setItem('data', JSON.stringify(res.data.map(el => ({...el, completed: false}))))
            setEmployeesData(JSON.parse(localStorage.getItem('data')))
          }
        })
        .catch(e => console.log('Error occurred', e))
    unusedLetters();
  }, [])

  const ref = useRef()


   return (
          <div className="container">
            <div className="wrapper">
              <div className="employees">
                <div className="employees_title align">Employees</div>
                <div className="employees_info_block">
                  {ALPHABET.map((letter, i) => (
                      <div className="employees_block" key={letter}>
                        <div className="employee_letter" key={i}>{letter}</div>
                        {employeesData.map(el => {
                          if (el['lastName'] !== undefined && el['lastName'][0].toLowerCase() === letter) {
                            return (
                                <div className="info_field" key={el["id"]}>
                                  <input type="checkbox" checked={el['completed'] ?? false}
                                         onChange={(e) => toggleCheckbox(e, el)}/>
                                  <div className="info_field_text">{el["lastName"]} {el["firstName"]}</div>
                                </div>
                            )
                          } else if(!unused_set.has(letter) && unused.includes(letter)) {
                              unused_set.add(letter)
                              return <div>-</div>
                          }
                        })
                        }
                        <br/>
                      </div>
                  ))}
                </div>
              </div>

              <div className="birthday">
                <div className="birthday_title align">Employees birthday</div>
                <div className="birthday_block">
                  {months.map(month => {
                    return (<div className="birthday_block_item" ref={ref} key={month}>
                      <div className="month_name">{month}</div>
                        {checkedEmployees.map(el => {
                        if(months[Number(el['dob'].substr(6,1))] === month) {
                          console.log(ref)
                          let date = el['dob'].substr(0, 10).split('-')
                          let day = date[2];
                          let date_month = months[Number(date[1])];
                          let year = date[0];
                          return (
                              <div className="birthday_info">
                                {el['firstName']} {el['lastName']} - {day} {date_month}, {year} year
                              </div>
                          )
                        }
                      })}
                    </div>)
                  })}
                </div>
              </div>
            </div>
          </div>
      );
}

export default App;
