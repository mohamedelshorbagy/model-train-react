import React, { Component } from 'react';
import { ENTITIES } from './constants'
import './App.css';
import Aux from './aux';
import saveAs from 'file-saver';
class App extends Component {
  state = {
    tuplePhrases: '',
    showPhrases: false,
    lines: [],
    lineIndex: -1,
    entityIndex: -1,
    newEntityKey: null,
    items: [1, 2, 3, 4]
  }


  addItem = () => {
    let items = [...this.state.items];

    items.push(5);

    this.setState({
      items: items
    });

  }

  removeItem = () => {
    let items = [...this.state.items];

    items.pop();

    this.setState({
      items: items
    });

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


  removeEntity = () => {
    let line = [...this.state.lines[this.state.lineIndex]];
    let lines = [...this.state.lines];
    line[1]['entities'].splice(this.state.entityIndex, 1);

    lines[this.state.lineIndex] = line;

    this.setState({
      lines: lines
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
      let line = lines[i];
      let phrase = line[0];
      let entities = line[1]['entities']; // Array
      line[2] = phrase;
      let originalPhrase = line[2]; // original phrase
      line[3] = []; // output content
      let actualEnd = -1;
      if (entities && entities.length) { // Exist
        for (let j = 0; j < entities.length; j++) {
          let entity = entities[j];
          /**
           * 0 => Start
           * 1 => End
           * 2 => Entity Name
           */

          let start = entity[0];
          if (start !== 0 && actualEnd === -1) {
            let tokensBetweenEntities = originalPhrase.substring(0, start);
            phrase = phrase.substring(tokensBetweenEntities.length);
            line[3].push(tokensBetweenEntities);
          }
          let end = entity[1];
          let entityName = entity[2];
          let token = originalPhrase.substring(start, end);
          if (actualEnd < start && actualEnd !== -1) {
            let tokensBetweenEntities = originalPhrase.substring(actualEnd, start);
            phrase = phrase.substring(tokensBetweenEntities.length);
            line[3].push(tokensBetweenEntities);
          }
          phrase = phrase.substring(token.length);
          actualEnd = end;
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
          line[3].push(tokenWithEntity);
        }
      }
      line[3].push(phrase);
    }


  }

  tuple2Arrays = (tuples) => {
    tuples = tuples.replace(/\(/g, '[').replace(/\)/g, ']');
    return Function(`return (${tuples});`)();
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
    console.group('text');
    console.log(1, 'New Data : ', event.target.innerText);
    console.groupEnd();
    let newData = event.target.innerText;
    let line = [...this.state.lines[index]];
    let lines = [...this.state.lines];
    newData = newData.replace(/(\r\n|\n|\r)/gm, '');
    if (newData === '') {
      line[1]['entities'] = [];
    }
    line[0] = newData;
    line[2] = newData;
    let phrase = line[0];
    let entities = line[1]['entities'];
    console.log(2, newData);
    console.log(1, newData);


    line[2] = phrase;
    let originalPhrase = line[2]; // original phrase
    line[3] = []; // output content
    let actualEnd = -1;
    if (entities && entities.length) { // Exist
      for (let j = 0; j < entities.length; j++) {
        let entity = entities[j];
        /**
         * 0 => Start
         * 1 => End
         * 2 => Entity Name
         */

        let start = entity[0];
        if (start !== 0 && actualEnd === -1) {
          let tokensBetweenEntities = originalPhrase.substring(0, start);
          phrase = phrase.substring(tokensBetweenEntities.length);
          line[3].push(tokensBetweenEntities);
        }
        let end = entity[1];
        let entityName = entity[2];
        let token = originalPhrase.substring(start, end);
        if (actualEnd < start && actualEnd !== -1) {
          let tokensBetweenEntities = originalPhrase.substring(actualEnd, start);
          phrase = phrase.substring(tokensBetweenEntities.length);
          line[3].push(tokensBetweenEntities);
        }
        phrase = phrase.substring(token.length);
        actualEnd = end;
        let tokenWithEntity =
          (<span
            entity={entityName}
            style={{
              backgroundColor: ENTITIES[entityName],
              cursor: 'pointer'
            }}
            onClick={() => this.getChangedIndex(index, j)}>
            {token}
          </span>);
        line[3].push(tokenWithEntity);
      }
    }
    line[3].push(phrase);
    console.log(line);
    lines[index] = line;

    this.setState({
      lines: lines
    });
  }


  saveFile = () => {
    let lines = [...this.state.lines];
    let text = this.arrays2Tuples(lines);

    let blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    saveAs(blob, "data.txt");
  }

  renderPhrases = () => {
    this.getEntitesFromPhrase(this.state.lines);
    return (
      <div className="container field">
        {
          this.state.lines.map((line, idx) => {
            let lineEntities;
            if (line[3] && line[3].length) {
              lineEntities = line[3].map((out, index) => (
                <Aux key={index}>
                  {out}
                </Aux>
              ))
            } else {
              lineEntities = null;
            }
            return (
              <Aux key={idx}>
                <div type="text" className="form-control" contentEditable name="phrase" suppressContentEditableWarning={true} onBlur={(e) => {
                  e.persist();
                  this.handleEditChange(e, idx);
                  // console.log(e.target.value);
                }}>
                  {
                    lineEntities
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
                        <button className="btn btn-danger" onClick={this.removeEntity}>Remove Entity</button>
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

    return (
      <div className="App">
        <div className="container">
          <button className="btn btn-default" onClick={this.addItem}>+ Add</button>
          <button className="btn btn-default" onClick={this.removeItem}>- Remove</button>

          <ul className="list-group">
            {
              this.state.items.map((el, index) => {
                return (<li className="list-group-item" key={index}>{el}</li>)
              })
            }

          </ul>


          <input type="text" placeholder="tuple" onChange={this.handleInputChange} className="form-control" />
          <div className="row">
            <div className="btns">
              <button className="btn btn-primary" onClick={this.togglePhrases}>Submit</button>
              <button className="btn btn-success" onClick={this.saveFile}>Save</button>
            </div>
          </div>
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
