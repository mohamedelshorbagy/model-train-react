import React, { Component } from 'react';
import { entities } from './constants'
import './App.css';
import Aux from './aux';

class App extends Component {
  state = {
    tuplePhrases: '',
    showPhrases: false,
    lines: []
  }


  handleInputChange = (event) => {
    this.setState({
      tuplePhrases: event.target.value
    });
  }

  togglePhrases = () => {
    const lines = this.tuple2Arrays(this.state.tuplePhrases);
    this.setState((prevState) => {
      return {
        ...prevState,
        showPhrases: !prevState.showPhrases,
        lines: lines
      }
    });
  }

  showEntities = (idx, ent) => {
    console.log(idx, ent);
  }
  getEntitesFromPhrase = (lines) => {
    for (let i = 0; i < lines.length; i++) {
      let phrase = lines[i][0];
      let entites = lines[i][1]['entities']; // Array
      lines[i][2] = phrase;
      let originalPhrase = lines[i][2];
      lines[i][3] = []; // output content
      if (entites && entites.length) { // Exist
        for (let j = 0; j < entites.length; j++) {
          let entity = entites[j];
          /**
           * 0 => Start
           * 1 => End
           * 3 => Entity Name
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
                backgroundColor: entities[entityName],
                cursor: 'pointer'
              }}
              onClick={() => this.showEntities(i, j)}>{token}</span>);
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

  renderPhrases = () => {
    return (<div className="container field">
      <div className="well entities">
        {
          Object.keys(entities).map((entity, key) => {
            return (
              <div className="entity" style={{
                backgroundColor: entities[entity]
              }} key={key}>
                {entity}
              </div>)

          })
        }
      </div>
      {
        this.state.lines.map((line, idx) => {
          return (
            <div type="text" className="form-control" contentEditable name="phrase" key={idx} suppressContentEditableWarning={true}>
              {line[3].map((out, index) => (
                <Aux key={index}>
                  {out}
                </Aux>
              ))
              }
            </div>
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
