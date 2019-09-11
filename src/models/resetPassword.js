import mongoose from 'mongoose';

let Schema = mongoose.Schema;

const ResetPasswordSchema = new Schema({
  userId: {
    type: String,
    trim: true,
    required: true
  },
  resetToken: {
    type: String,
    trim: true,
    required : true
  },
  linkExpired : {
      type : Date,
      trim : true,
      required : true
  },
}, {
  timestamps: true
});

module.exports = mongoose.model('ResetPassword', ResetPasswordSchema);