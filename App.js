import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, FlatList, TouchableHighlight} from 'react-native';

var SQLite = require('react-native-sqlite-storage');

const SQL_DROP_TODO = 'DROP TABLE todos';

const SQL_CREATE_TODO = 'CREATE TABLE IF NOT EXISTS todos ( '+
  'id INTEGER PRIMARY KEY AUTOINCREMENT, '+
  'name TEXT, '+
  'ischecked INTEGER NOT NULL )';

const SQL_INSERT_TODO = 'INSERT INTO todos ( name, ischecked ) VALUES ( ?, ? ) ';

const SQL_SELECT_TODOS = 'SELECT id, name, ischecked FROM todos ORDER BY id ';

const SQL_UPDATE_TODO = 'UPDATE todos SET ischecked=? WHERE id = ? ';

type Props = {};
export default class App extends Component<Props> {

  db;

  constructor(props){
    super(props);
    this.state = {
      todos: []
    };
  }


  componentDidMount(){
    this.connection();
    this.fillTodos();
    this.getTodos();
  }

  doSql( sql, params, successFun ){
    this.db.transaction(
      tx=>{
        tx.executeSql( sql, params, ( tx, results ) => {
          console.log( 'created table' );
          successFun(results);
        }, (err) => {
          console.log( 'Error executeSql:' );  
          return null;
        } );
    }, err=>{
      console.log( 'error transaction', err );
    });
  }

  connection(){
    console.log('Estableciendo la conexión');
    this.db = SQLite.openDatabase( { name: 'database-test.db' } );
    this.doSql( SQL_DROP_TODO, [] );
    this.doSql( SQL_CREATE_TODO, [] );
  }

  fillTodos(){
    this.doSql( SQL_INSERT_TODO, [ 'Mi tarea 1', 0 ] );
    this.doSql( SQL_INSERT_TODO, [ 'Mi tarea 2', 0 ] );
    this.doSql( SQL_INSERT_TODO, [ 'Mi tarea 3', 0 ] );
    this.doSql( SQL_INSERT_TODO, [ 'Mi tarea 4', 0 ] );
  }
  
  getTodos(){
    this.doSql( SQL_SELECT_TODOS, [], (results)=>{
      console.log( 'todos:', results.rows );
      this.setState({ todos: results.rows.raw() })
    } );    
  }

  updateTodo( todo ){    
    console.log('todo.id:',todo.id);
    this.doSql( SQL_UPDATE_TODO, [ todo.ischecked == 1 ? 0 : 1, todo.id ], (results)=>{
      console.log('actualiza:',todo.id);
      this.getTodos();
    } );    
  }

  renderItem=({item}) => <TouchableHighlight 
    onPress={()=> this.updateTodo( item )}
    underlayColor="#ccc"  
  >
    <View style={styles.container} backgroundColor={ item.ischecked == 0 ? '#00f' : '#F00' } >
        <View style={styles.content}>
            <Text style={styles.contactName}>{item.name}</Text>
        </View>
    </View>
  </TouchableHighlight>
  separatorComponent=()=> <View style={styles.separator}></View>
  emptyComponent=()=> <Text>No hay productos</Text> 
  keyExtractor=item => item.id.toString()

  render() {
    return (
      <View style={styles.container}>
        <FlatList
          data={this.state.todos}
          renderItem={this.renderItem}
          ListItemComponent={this.emptyComponent}
          ItemSeparatorComponent={this.separatorComponent}
          keyExtractor={this.keyExtractor}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
  separator: {
    borderBottomWidth: 2,
    borderBottomColor: '#ccc',
    marginVertical: 3,
  },
  content: {
    paddingLeft: 10,
    justifyContent: 'center',
  },
  contactName:{
    fontSize: 24,
    fontWeight: '200',
  }
});
