import React, { Component } from 'react';
import PouchDB from 'pouchdb';

let remortRooms = {};
let localRooms = {};
for(let i = 0;i<5;i++){
  localRooms[`room${i}`] = new PouchDB(`room${i}`)
  remortRooms[`room${i}`] = new PouchDB(`http://localhost:5984/room${i}`, {live: true})
  localRooms[`room${i}`].sync(remortRooms[`room${i}`], {live: true, retry: true})
}
class App2 extends Component {
  state = {
    inputRoom: '',
    inputMessage: '',
    currentRoom: 'room0',
    localRooms: localRooms,
    messages: []
  }
  componentDidMount = () => {
    Object.keys(this.state.localRooms).forEach(roomId => {
      this.state.localRooms[roomId].changes({
        since: 'now',
        live: true,
        include_docs: true
      }).on('change', (change) => {
        if (roomId === this.state.currentRoom) {
          this.state.localRooms[roomId].allDocs({include_docs: true}).then((res) => {
            this.setState({messages: res.rows.map(row => {return row.doc})});
          })
        }
      })
    })
  }
  render() {
    return (
      <div>
        <select value={this.state.currentRoom} onChange={e => {
          let currentRoom = e.target.value
          this.state.localRooms[currentRoom].allDocs({include_docs: true}).then((res) => {
            this.setState({currentRoom: currentRoom, messages: res.rows.map(row => {return row.doc})});
          })}}>
          {
            Object.keys(this.state.localRooms).map((key, index) => {return <option key={index} value={key}>{key}</option>})
          }
        </select>
        <div>
          <input value={this.state.inputMessage} onChange={(e)=>{this.setState({inputMessage: e.target.value})}}/>
          <button onClick={() => {
            this.state.localRooms[this.state.currentRoom].put({_id: new Date().getTime().toString(), message: this.state.inputMessage})}}>post</button>
        </div>
        <ul>
          {this.state.messages.map((message,index) => {return <li key={index}>{message.message}</li>})}
        </ul>
      </div>
    )
  }
}
export default App2;
