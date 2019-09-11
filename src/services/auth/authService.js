import Candidate from 'models/candidate'
import ResetPassword from 'models/resetPassword';

export class AuthService {
    constructor(userType){
        this._userType = userType;
    }

    getDB(){
        if(this._userType === 'candidates'){
            return Candidate;
        }else if(this._userType === 'recruiter'){
            return Recruiter;
        }else{
            return null;
        }
    }

    async getUserById(userId){
        let db = this.getDB();
        return await db.findByUserId(userId);
    }

    async getUserByUserName(username) {
        let db = this.getDB();
        return await db.findByUserName(username);
    }

    async getUserByToken(token) {
        let db = this.getDB();
        return await db.findByToken(token);
    }

    async updateUser(query,data){
        let db = this.getDB();

        return await db.updateOne(query,data);
    }

    async login(data) {
        try{
            let db = this.getDB();
            if(!db){
                return null;
            }

            let users = await this.getUserByUserName(data.username); 

            return users;
        }catch(err){
            throw new Error(err);
        }
    }

    async register(data){
        try{
            let db = this.getDB();
            if(!db){
                return null;
            }

            let users = await db.create(data); 

            return users;
        }catch(err){
            throw new Error(err);
        }
    }

    async resetPassword(data) {
        try{
            return ResetPassword.update({"userId" : data.userId},{$set : data},{upsert : true});
        }catch(err){
            throw new Error(err);
        }
    }

    async getResetToken(resetToken){
        try{
            return ResetPassword.findOne({"resetToken":resetToken});
        }catch(err){
            throw new Error(err);
        }
    }

    async removeResetToken(userId){
        try{
            return ResetPassword.deleteOne({"userId":userId});
        }catch(err){
            throw new Error(err);
        }
    }
}