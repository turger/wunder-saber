import firebase from 'firebase/app'
import 'firebase/database'

var config = {
    apiKey: process.env.REACT_APP_APIKEY,
    authDomain: process.env.REACT_APP_AUTHDOMAIN,
    databaseURL: process.env.REACT_APP_DATABASEURL,
    projectId: process.env.REACT_APP_PROJECTID,
    storageBucket: process.env.REACT_APP_STORAGEBUCKET,
    messagingSenderId: process.env.REACT_APP_MESSAGINGSENDERID
}

const fb = firebase.initializeApp(config)

export const getLeaderboardData = () =>
  fb.database().ref(`leaderboard`).once('value').then((snap) => snap.val())

export const getLeaderboardRef = () => fb.database().ref(`leaderboard`)

export const addSong = (songId, songName) => {
  fb.database().ref(`leaderboard/${songId}`).set({songId: songId, songName})
}

export const addRow = (songId, rowId, name, points) => {
  fb.database().ref(`leaderboard/${songId}/rows/${rowId}`).set({rowId: rowId, name, points})
}

export const removeRow = (songId, rowId) => {
  fb.database().ref(`leaderboard/${songId}/rows/${rowId}`).remove()
}
