import React from 'react';
import logo from './logo.svg';
import './App.css';
import PropTypes from 'prop-types';
import Header from './layouts/header';
import { Octokit } from 'octokit';
const Jszip = require('jszip')
var gh = require('parse-github-url');

const octokit = new Octokit({
  auth: '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'
})

async function f(urlE)
{
  var urldata=gh(urlE);

  console.log(urldata)
  let path = ""
  if (!urldata.type)
  {
    if (urldata.path != urldata.repo)
    {
    path = urldata.path
    console.log(urldata.branch)
    path = path.substring(path.indexOf(urldata.branch))
    path=path.substring(path.indexOf("/")+1)
      }


    
    }

    
  const { data } = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
    owner: urldata.owner,
    repo: urldata.name,
    path: (urldata.type)?urldata.filepath:path
  })
  return data
}

async function makezip(zip,part)
{
  for (const p of part)
  {

    if (p.type === "file")
    {
      console.log(p.content)
      var filedata= await f(p.html_url)
      let decoded = atob(filedata.content)
      console.log(decoded)
      zip.file(p.name, decoded);
    }
    else
    {
      var newfolder = zip.folder(p.name);
      var folderdata= await f(p.html_url)
      await makezip(newfolder,folderdata)
    }

    }
}


class AddTodo extends React.Component {
    state = {
        title: ''
    }

    onSubmit = (e) => {
      e.preventDefault();

        this.props.addTodo(this.state.title)

        this.setState({ title: '' });
    }

    onChange = (e) => this.setState({ title: e.target.value });

    render() {
        return (
            <form onSubmit={this.onSubmit} style={{display: 'flex'}}>
                <input 
                    type="text" 
                    name="title"
                    style={{flex: '10', padding: '5px'}}
                    placeholder="link" 
                    value={this.state.title}
                    onChange={this.onChange}
                />
                <input 
                    type="submit"
                    value="Submit"
                    className="btn"
                    style= {{flex: '1'}}
                />
            </form>
        )
    }
}



class TodoItem extends React.Component {
  getStyle = () => {
      return {
          background: '#F4F4F4',
          padding: '10px',
          borderBottom: '1px #ccc dotted',
          textDecoration: this.props.todo.completed ? 'line-through' : 'none',
      }
  };


  render() {
    const todo = this.props.todo;
    console.log(todo)
      return (
        <div style={this.getStyle()}>
          <div>
            <span>{todo.title}</span>
          </div>
          
              <p>
            <a href={ todo.downloadlink } download={todo.name} className="button">save</a>
              </p>
          </div>
      )
  }
}





class Todos extends React.Component {
  render() {
  var  a=this.props.todos.map((todo) => (

          <TodoItem  todo = {todo}  />
  )
 
  );
  return a
    

  }
}





class App extends React.Component {
  state = {
    todos: []
  }




  addTodo = (title) => {
    let file = new Object()
    



    f(title).then(
      (value) =>
      {


        let name, downloadlink;
        let was_file = false;

        
      
          if (value.type === 'file')
          {
            console.log("to")
            name=value.name;
            let decoded = atob(value.content)
            const file = new Blob([decoded], { type: 'text/plain' });
            downloadlink = URL.createObjectURL(file);
            was_file=true;
      
          }
          else
            
          {
            let zip=new Jszip()
            async function getziplink(e)
            {
              console.log(value)
              await makezip(zip, value)
              
              var url = await zip.generateAsync({ type: "base64" })
              downloadlink = "data:application/zip;base64," + url
              name=title
              console.log(e)
              file = { downloadlink: downloadlink, title: title, name: name + ".zip"}
            e.setState({ todos: [...e.state.todos,file]})
            }
            

            getziplink(this)
            // .then(function (base64) {
            //   downloadlink = "data:application/zip;base64," + base64;
            //   name=value.name
          
            

          }

        
        if (was_file)
        {
                  file = { downloadlink: downloadlink, title: title, name: name }
        this.setState({ todos: [...this.state.todos,file]})
            }


      
      },
      
      (error) =>
      {
        console.log("error is occured")
        console.log(error)
      }
      
    )
    
  }

  render() {
    return (

        <div className="App">
          <div className="container">
  
          <Header />
          <br/>
          <React.Fragment>
          <AddTodo addTodo={this.addTodo} />
                <Todos todos={this.state.todos} markComplete = {this.markComplete} delTodo={this.delTodo}/>
        
        </React.Fragment>
                

          </div>
        </div>

    );
  }
}

export default App;
