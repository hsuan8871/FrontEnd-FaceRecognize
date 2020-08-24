import React,{Component} from 'react';
import Navigation from './component/Navigation/Navigation';
import Logo from './component/Logo/Logo';
import Rank from './component/Rank/Rank';
import Register from './component/Register/Register';
import SignIn from './component/SignIn/SignIn';
import FaceRecognition from './component/FaceRecognition/FaceRecognition';
import ImageLinkForm from './component/ImageLinkForm/ImageLinkForm';
import './App.css';
import Particles from 'react-particles-js';

const particlesOptions = {
            particles: {
            			number: {
                    value: 30,
                    density:{
                      enable:true,
                      value_area: 2800
                    }
                  }
            		}
              }


const initialState ={

    input:'',
    imageUrl:'',
    box:{},
    route: 'signin',
    isSignedIn: false,
    user: {
        id: '',
        name: '',
        email:'',
        entries: 0,
        joined: ''

    }
  }


class App extends Component {

  constructor(){
    super();
    this.state= initialState;
  }

  loadUser = (data) =>{
    this.setState({user: {
      id: data.id,
      name: data.name,
      email:data.email,
      entries: data.entries,
      joined: data.joined
    }})
  }
// connect front end to the server.
/*
  componentDidMount(){
    fetch('http://localhost:3000')
    .then(response => response.json())
    .then(console.log)
  }*/

  calculateFaceLocation = (data) => {
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputimage');
    const width =Number(image.width);
    const height=Number(image.height);

    return{
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - (clarifaiFace.right_col * width),
      bottomRow: height - (clarifaiFace.bottom_row * height)
    }
  }

  displayFaceBox = (box) =>{
    console.log(box);
    this.setState({box: box});
  }

  onInputChange = (event) =>{
    this.setState({input: event.target.value});
  }

  onButtonSubmit = () => {
     //console.log('click');
    this.setState({imageUrl:this.state.input});
      fetch('http://localhost:3000/imageurl', {
        method: 'post',
        headers:{'content-Type':'application/json'},
        body: JSON.stringify({
          input: this.state.input
      })
    })
    .then(response =>response.json())
      .then( response => {
      if(response){
        fetch('http://localhost:3000/image', {
          method: 'put',
          headers:{'content-Type':'application/json'},
          body: JSON.stringify({
            id: this.state.user.id
        })
      })
      .then(response => response.json())
      .then(count=> {
        this.setState(Object.assign(this.state.user,{entries: count}))
      })
      .catch(console.log)
      }
      this.displayFaceBox(this.calculateFaceLocation(response))
    })
    .catch(err => console.log(err))
  }


      //console.log(response.outputs[0].data.regions[0].region_info.bounding_box);

  onRouteChange = (route) =>{
    if (route === 'signout'){
      this.setState(initialState)
    } else if (route==='home'){
      this.setState({isSignedIn:true})
    }
    this.setState({route:route});
  }



  render(){
    return (
      <div className="App">
      <Particles className ='particles'
  params={{
    particles: { particlesOptions}
  }}
/>
        <Navigation isSignedIn={this.state.isSignedIn} onRouteChange={this.onRouteChange}/>
        {this.state.route === 'home'
        ? <div>
            <Logo/>
              <Rank name={this.state.user.name} entries={this.state.user.entries}/>
            <ImageLinkForm
            onInputChange={this.onInputChange}
            onButtonSubmit={this.onButtonSubmit}
            />
            <FaceRecognition imageUrl={this.state.imageUrl} box={this.state.box}/>
        </div>
        : (
          this.state.route === 'signin'
          ? <SignIn loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
          : <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
        )
        }
      </div>
    );
  }
}

export default App;
