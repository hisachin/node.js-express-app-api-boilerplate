import mongoose from 'mongoose';

let Schema = mongoose.Schema;

const GENDER = ['male','female','transgender','other'];
const MARTIALSTATUS = ['unmarried','married','divorced','widow'];

const UserSchema = new Schema({
  username: {
    type: String,
    trim: true,
    required: true
  },
  fName: {
    type: String,
    trim: true
  },
  mName: {
    type: String,
    trim: true
  },
  lName: {
    type: String,
    trim: true
  },
  password : {
      type : String,
      trim : true,
      required : true
  },
  email: {
    type : String,
    trim : true,
    lowercase : true
  },
  gender : {
    enum : GENDER
  },
  dob : {
    type : Date
  },
  martialStatus : {
    enum : MARTIALSTATUS
  },
  isVerified : {
      type : Boolean,
      default : false
  },
  accountVerificationToken : {
    type : String,
    trim : true
  },
  accountVerificationTokenExpired : {
    type : Date
  },
}, {
  timestamps: true
});


UserSchema.methods._view = () => {
  const {
    username,
    fName,
    mName,
    lName
  } = this;
  return {
    username,
    fName,
    mName,
    lName
  };
};

UserSchema.statics.findByUserId = async (userId) => {
  return mongoose.model('User').findOne({"_id" : userId});
}

UserSchema.statics.findByUserName = async (username) => {
    return mongoose.model('User').findOne({"username" : username});
}

UserSchema.statics.findByToken = async (token) => {
    return mongoose.model('User').findOne({"accountVerificationToken" : token});
}

module.exports = mongoose.model('User', UserSchema);