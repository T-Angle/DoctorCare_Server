import db from '../models/index';

//Render data to view
let getHomePage = async(req, res) => {
    try {
        let data = await db.User.findAll();
        console.log('---------')
        console.log(data)
        console.log('---------')
        return res.render('homePage.ejs', {
            data: JSON.stringify(data)
        });
    } catch (e) {
        console.log(e);
    }
}

// object:{
//     key:'',
//     value:'',
// }
module.exports = {
    getHomePage: getHomePage,
} 