const asyncHandler = (requestHanlder)=>{
    return (req,res, next)=>{
        Promise.resolve(requestHanlder(req,res)).catch(err=> next(err));
    }
}
export  { asyncHandler };