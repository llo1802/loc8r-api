const mongoose = require("mongoose");
const Loc = mongoose.model('Location');


const locationsReadOne = async (req, res) => {
    await Loc
        .findById(req.params.locationid)
        .exec((err, location) => {
            if(!location){
                return res
                    .status(404)
                    .json({
                        "message":"lcoation not found"
                    });
            } else if (err){
                return res
                    .status(404)
                    .json(err);
            }
            res
                .status(200)
                .json(location);
        
        });
};


const locationsListByDistance = async (req, res) =>{
    const lng = parseFloat(req.query.lng);
    const lat = parseFloat(req.query.lat);
    const near = {
        type: "Point",
        coordinates : [lng, lat]
    };
    const geoOptions = {
        distanceField: "distance.calculated",
        key: 'coords',
        spherical: true,
        maxDistance: 200000
    };
    
    if(!lng || !lat){
        return res
            .status(404)
            .json({"message": "lng and lat query parameter are required"});
    }
    try{
        const results = await Loc.aggregate([
            {
                $geoNear: {
                    near,
                    ...geoOptions
                }
            }
        ]);
        const locations = results.map(result => {
            return{
                _id: result._id,
                name: result.name,
                address: result.address,
                rating: result.rating,
                facilities: result.facilities,
                distance: `${result.distance.calculated.toFixed()}`
            }
        });
        res
            .status(200)
            .json(locations);
    } catch(err){
        console.log(err);
        res
            .status(404)
            .json(err);
    }
};

const locationsCreate = async (req, res) =>{
    await Loc.create({
            name: req.body.name,
            address: req.body.address,
            facilities: req.body.facilities.split(","),
            coords: {
                type: "Point",
                coordinates: [
                    parseFloat(req.body.lng),
                    parseFloat(req.body.lat)
                ]
            },
            openngTimes:[
                {
                    days: req.body.days1,
                    opening: req.body.opening1,
                    closeing: req.body.closeing1,
                    colsed: req.body.closed1
                },
                {
                    days: req.body.days2,
                    opening: req.body.opening2,
                    closeing: req.body.closeing2,
                    colsed: req.body.closed2
                }
            ]
        },
        (err,location) => {
            if(err){
                res
                    .status(400)
                    .json(err);
            } else{
                res
                    .status(201)
                    .json(location);
            }
        
    });
};
const locationsUpdateOne = async (req, res) =>{
    if(!req.params.locationid){
        return res
        .status(404)
        .json({"message":"Not found, locationid is required"});
    }
    await Loc
        .findById(req.params.locationid)
        .select('-reviews -rating')
        .exec((err, location) =>{
            if(!location){
                return res
                .json(404)
                .status({
                    "message" : "locationid not found"
                });
            } else if (err){
                return res
                .status(400)
                .json(err);
            }
            location.name = req.body.name;
            location.address = req.body.address;
            location.facilities = req.body.facilities.split(',');
            location.coords = [
                parseFloat(req.body.lng),
                parseFloat(req.body.lat)
            ];
            location.openngTimes = [
                {
                    days: req.body.days1,
                    opening: req.body.opening1,
                    closeing: req.body.closeing1,
                    colsed: req.body.closed1
                },
                {
                    days: req.body.days2,
                    opening: req.body.opening2,
                    closeing: req.body.closeing2,
                    colsed: req.body.closed2
                }
            ];
            location.save((err,loc) => {
                if(err){
                    res
                        .status(404)
                        .json(err)
                } else{
                    res
                        .status(200)
                        .json(loc)
                }
            });
        })
};
const locationsDeleteOne = async (req, res) =>{
    const {locationid} = req.params;
    if(locationid){
        await Loc
            .findByIdAndRemove(locationid)
            .exec((err,location) =>{
                if(err){
                    return res  
                        .status(404)
                        .json(err);
                }
                res
                    .status(204)
                    .json(null);
            });
    } else{
        res
            .status(404)
            .json({"message" : "No Location"});
    }
};

module.exports ={
    locationsListByDistance,
    locationsCreate,
    locationsUpdateOne,
    locationsReadOne,
    locationsDeleteOne,
}