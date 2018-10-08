import { Component } from '@angular/core';
import {IonicPage,NavController,NavParams,ToastController } from 'ionic-angular';
import {AngularFireAuth} from 'angularfire2/auth';
import 'rxjs/add/operator/toPromise';
import {
  AngularFireStorage,
  AngularFireStorageReference,
  AngularFireUploadTask
} from 'angularfire2/storage';
import * as firebase from "firebase";
import {firebaseConfig} from "../../app/config";
import {firestore} from "firebase";
import {Camera} from '@ionic-native/camera'
import {ContentType} from "@angular/http/src/enums";


@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  private img1: any;
  public static uid: string;

  constructor(private afAuth: AngularFireAuth, private toast: ToastController,
              private afstorage: AngularFireStorage, public navparms: NavParams,
              public cameraPlugin: Camera,
              public navCtrl: NavController) {
  }

  ionViewDidLoad() {
    this.afAuth.authState.subscribe(data => {
      HomePage.uid = data.uid;
      if (data.email && data.uid) {
        this.toast.create({
          message: 'welcome to ' + data.email,
          duration: 3000
        }).present();
      }
      else {
        this.toast.create({
          message: 'Could not find details'
        }).present();
      }
    })
  }

  fileChange(event) : AngularFireUploadTask{
    if (event.target.files && event.target.files[0]) {
      let reader = new FileReader();
      reader.onload = (event: any) => {
        this.img1 = event.target.result;
      };
      reader.readAsDataURL(event.target.files[0]);
    }
    let fileList: FileList = event.target.files;
    let file: File = fileList[0];
    const storageRef: AngularFireStorageReference = this.afstorage
      .ref('/' + HomePage.uid + '/' +file.name);
      storageRef.put(file).then(snapshot => {
      firebase.storage().ref('/' + HomePage.uid + '/' +file.name).getDownloadURL().then(function(url){
        console.log(url);
        firebase.database().ref(HomePage.uid).push(url);
      }).catch(function(error){
        console.log(error);
      });
    });
    return storageRef.put(file);
  }
  viewimage(){
    firebase.database().ref(HomePage.uid).once('value', function(snapshot){
      let imagedata = snapshot.val();
      let keys = Object.keys(snapshot.val());
      var htmlData = "";
      for(var i =0;i<keys.length;i++) {
        htmlData += "<img src="+imagedata[keys[i]]+" class='imgStyle'>";
      }
      console.log(snapshot.val());
      document.getElementById('container').innerHTML = htmlData;
    });

  }
}





