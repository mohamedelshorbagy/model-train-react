import React, { Component } from 'react';
import { ENTITIES } from './constants'
import './App.css';
import Aux from './aux';

class App extends Component {
  state = {
    tuplePhrases: '',
    showPhrases: false,
    lines: [],
    lineIndex: -1,
    entityIndex: -1,
    newEntityKey: null
  }


  handleInputChange = (event) => {
    this.setState({
      tuplePhrases: event.target.value
    });
  }

  getChangedEntity = (newEntity) => {
    this.setState({
      newEntityKey: newEntity
    }, () => {
      this.updateEntity();
    })
  }

  getChangedIndex = (lineIndex, entityIndex) => {
    this.setState({
      lineIndex: lineIndex,
      entityIndex: entityIndex
    })
  }

  updateEntity = () => {
    let line = [...this.state.lines[this.state.lineIndex]];

    let phrase = line[0];
    let entities = line[1]['entities']; // Array
    let originalPhrase = line[2];
    line[3] = [];
    line[4] = false;
    if (entities && entities.length) { // Exist
      entities[this.state.entityIndex][2] = this.state.newEntityKey;
      for (let j = 0; j < entities.length; j++) {
        let entity = entities[j];

        /**
         * 0 => Start
         * 1 => End
         * 2 => Entity Name
         */
        let start = entity[0];
        let end = entity[1];
        let entityName = entity[2];
        let token = originalPhrase.substring(start, end);
        phrase = phrase.slice(end);
        let tokenWithEntity =
          (<span
            entity={entityName}
            style={{
              backgroundColor: ENTITIES[entityName],
              cursor: 'pointer'
            }}
            onClick={() => this.getChangedIndex(this.state.lineIndex, j)}>
            {token}
          </span>);
        line[3].push(tokenWithEntity);
      }
      line[3].push(phrase);
    }


    let lines = [...this.state.lines];

    lines[this.state.lineIndex] = line;

    this.setState({
      lines: lines
    })

  }

  togglePhrases = () => {
    const lines = this.tuple2Arrays(this.state.tuplePhrases);
    this.setState((prevState) => {
      return {
        ...prevState,
        showPhrases: true,
        lines: lines
      }
    });
  }


  getEntitesFromPhrase = (lines) => {
    for (let i = 0; i < lines.length; i++) {
      let phrase = lines[i][0];
      let entites = lines[i][1]['entities']; // Array
      lines[i][2] = phrase;
      let originalPhrase = lines[i][2]; // original phrase
      lines[i][3] = []; // output content
      if (entites && entites.length) { // Exist
        for (let j = 0; j < entites.length; j++) {
          let entity = entites[j];
          /**
           * 0 => Start
           * 1 => End
           * 2 => Entity Name
           */
          let start = entity[0];
          let end = entity[1];
          let entityName = entity[2];
          let token = originalPhrase.substring(start, end);
          phrase = phrase.slice(end);
          let tokenWithEntity =
            (<span
              entity={entityName}
              style={{
                backgroundColor: ENTITIES[entityName],
                cursor: 'pointer'
              }}
              onClick={() => this.getChangedIndex(i, j)}>
              {token}
            </span>);
          lines[i][3].push(tokenWithEntity);
        }
        lines[i][3].push(phrase);
      }
    }

  }

  tuple2Arrays = (tuples) => {
    tuples = tuples.replace(/\(/g, '[').replace(/\)/g, ']');
    let result = eval(tuples);
    return result;
  }

  arrays2Tuples = (array) => {
    let container = '[';
    let outerComma = ',';
    for (let i = 0; i < array.length; i++) {
      let tuple = array[i];
      let innerTuple = `(${this.qoutedString(tuple[0])},`; // Phrase

      let Entites = '';
      tuple[1]['entities'].forEach((el, index) => {
        let innerComma = ',';
        let tempString = el.reduce((acc, elm, idx) => {
          return idx === 0 ? this.qoutedString(elm) : acc + ', ' + this.qoutedString(elm);
        }, '');
        if (index === (tuple[1]['entities'].length - 1)) { // For concat inner tuples inside entities
          innerComma = '';
        }
        Entites += `(${tempString})${innerComma}`;
      });

      Entites = `{ 'entities': [${Entites}] }`;
      innerTuple += `${Entites})`;

      if (i === array.length - 1) {
        outerComma = '';
      }
      container += `${innerTuple}${outerComma}`
    }

    container += ']';
    return container;
  }

  qoutedString = (term) => {
    if (typeof term === 'string') {
      return `'${term}'`;
    }
    return term;
  }

  handleEditChange = (event, index) => {
    console.log(event.target.value);
    let line = [...this.state.lines[index]];
    let lines = [...this.state.lines];
    line[0] += event.target.value;
    line[2] += event.target.value;
    line[3][line[3].length - 1] += event.target.value;
    lines[index] = line;
    this.setState({
      lines: lines
    });
  }

  renderPhrases = () => {
    return (<div className="container field">

      {
        this.state.lines.map((line, idx) => {
          return (
            <Aux key={idx}>
              <div type="text" className="form-control" contentEditable name="phrase" suppressContentEditableWarning={true} onInput={(e) => {
                // this.handleEditChange.bind(this, e, idx)
                // e.persist();
                // console.log(e.target.value);
              }}>
                {line[3].map((out, index) => (
                  <Aux key={index}>
                    {out}
                  </Aux>
                ))
                }
              </div>
              {
                this.state.lineIndex === idx ?
                  (
                    <div className="card bg-light entities">
                      {
                        Object.keys(ENTITIES).map((entity, key) => {
                          return (
                            <div className="entity" style={{
                              backgroundColor: ENTITIES[entity]
                            }} key={key}
                              onClick={() => this.getChangedEntity(entity)}>
                              {entity}
                            </div>)

                        })
                      }
                    </div>
                  )
                  : null
              }
            </Aux>
          )

        })
      }
    </div>)
  }

  render() {
    if (this.state.showPhrases) {
      this.getEntitesFromPhrase(this.state.lines);
    }
    return (
      <div className="App">
        <div className="container">
          <input type="text" placeholder="tuple" onChange={this.handleInputChange} className="form-control" />
          <button className="btn btn-primary" onClick={this.togglePhrases}>Submit</button>
          <hr />
          {
            this.state.showPhrases ? this.renderPhrases() : null
          }

        </div>
      </div>
    );
  }
}

export default App;
