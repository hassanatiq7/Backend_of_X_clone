import Notification from "../models/notification.model.js"



export const getNotification = async(req,res) =>{
    try {
        const userId = req.user._id

        const notification = await Notification.find({to: userId}).populate({
            path: 'from',
            select: 'userName profilePic'
        })

        await Notification.updateMany({to: userId}, {read: true})

        res.status(200).json({
            notification
        })

    } catch (error) {
        console.error(`Error in getNotification ${error}`)
        res.status(500).json({
            error: 'Internal server error'
        })
    }
}


export const deleteNotifications = async(req,res)=>{
    try {
        const userId = req.user._id

        await Notification.deleteMany({to:userId})

        res.status(200).json({
            message: 'Notifications deleted'
        })
    } catch (error) {
        console.error(`Error in deleteNotification ${error}`)
        res.status(500).json({
            error: 'Internal server error'
        })
    }
}



export const deleteNotification = async(req,res) => {
    try {

        const userId = req.user._id
        const notificationId = req.params.id

        const notification = await Notification.findById(notificationId)

        if(!notification){
            res.status(404).json({
                error: 'Notification not found'
            })
        }

        if(notification.to.toString() !== userId.toString()){
            res.status(401).json({
                error: 'Unauthorized'
            })
        }

        await Notification.findByIdAndDelete(notificationId)
        res.status(200).json({
            message: 'Notification deleted'
        })
        
    } catch (error) {
        console.error(`Error in deleteNotification ${error}`)
        res.status(500).json({
            error: 'Internal server error'
        })
    }
}