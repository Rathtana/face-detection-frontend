import React, { Component } from 'react';
import Navigation from './components/Navigation/Navigation';
import Logo from './components/Logo/Logo';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import Rank from './components/Rank/Rank';
import Signin from './components/Signin/Signin'
import Register from './components/Register/Register'
import './App.css';

const isEmpty = (obj) => {
  for(let key in obj) {
      if(obj.hasOwnProperty(key))
          return false;
  }
  return true;
}

const initialState = {
  input: '',
  imageUrl: '',
  boxes: [],
  route: 'signin',
  isSignedIn: false,
  user: {
    id: '',
    name: '',
    email: '',
    entries: 0,
    joined: ''
  }
}
class App extends Component {
  constructor() {
    super();
    this.state = initialState;
  }

	loadUser = (user) => {
		this.setState({user: {
			id: user.id,
			name: user.name,
			email: user.email,
			entries: user.entries,
			joined: user.joined
		}})
	}
  

  calculateFaceLocation = (data) => {
    //no face detected 
    if (isEmpty(data.outputs[0].data)) {
      return [];
    }

    const image = document.getElementById('inputImage');
    const width = Number(image.width);
    const height = Number(image.height);
    const boxArray = data.outputs[0].data.regions.map((clarifaiFace) => {
      return {
      leftCol: clarifaiFace.region_info.bounding_box.left_col * width,
      topRow: clarifaiFace.region_info.bounding_box.top_row * height,
      rightCol: width - (clarifaiFace.region_info.bounding_box.right_col * width),
      bottomRow: height - (clarifaiFace.region_info.bounding_box.bottom_row * height)
      }
        
    })
    return boxArray;
  }

  displayFaceBox = (boxes) => {
    this.setState({boxes: boxes});
  }

  onInputChange = (event) => {
    this.setState({input: event.target.value});
  }

  onButtonSubmit = () => {
    this.setState({imageUrl: this.state.input})
    fetch('https://damp-crag-20595.herokuapp.com/imageurl', {
        method: 'post',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          input: this.state.input
        })
      })
    .then(response => response.json())
    .then(response => {
			if(response) {
				fetch('https://damp-crag-20595.herokuapp.com/image', {
          method: 'put',
					headers: {'Content-Type': 'application/json'},
					body: JSON.stringify({
						id: this.state.user.id
					})
				})
					.then(response => response.json())
					.then(count => {
						this.setState(Object.assign(this.state.user, {entries: count}))
					})
          .catch(console.log)
			}
			this.displayFaceBox(this.calculateFaceLocation(response))
		})
    .catch(err => console.log(err));  
  } 

  onRouteChange = (route) => {
  if(route === 'signout') {
    route = 'signin'
		this.setState(initialState);
	} else if(route === 'home') {
		this.setState({isSignedIn: true});
	}
    this.setState({route: route})
  }

  render() {
	const { isSignedIn, imageUrl, route, boxes } = this.state;
    return (
      <div className="App">
        <Navigation isSignedIn={isSignedIn} onRouteChange={this.onRouteChange} />
        { route === 'home' 
          ? <div>   
              <Logo />
              <Rank name={this.state.user.name} entries={this.state.user.entries}/>
              <ImageLinkForm 
                onInputChange={this.onInputChange}
                onButtonSubmit={this.onButtonSubmit}/>
              <FaceRecognition boxes={boxes} imageUrl={imageUrl} />
             </div>
		  :	(
			route === 'signin' 
			? <Signin loadUser={this.loadUser} onRouteChange={this.onRouteChange} onKeyPressed={this.onKeyPressed}/> 
			: <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange} /> 
			) 
		}
      </div>
    );
  }
}

export default App;
