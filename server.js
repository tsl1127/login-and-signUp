var http = require('http')
var fs = require('fs')
var url = require('url')
var port = process.argv[2]

if(!port){
  console.log('请指定端口号好不啦？\nnode server.js 8888 这样不会吗？')
  process.exit(1)
}

let sessions ={

}

var server = http.createServer(function(request, response){
  var parsedUrl = url.parse(request.url, true)
  var pathWithQuery = request.url 
  var queryString = ''
  if(pathWithQuery.indexOf('?') >= 0){ queryString = pathWithQuery.substring(pathWithQuery.indexOf('?')) }
  var path = parsedUrl.pathname
  var query = parsedUrl.query
  var method = request.method

  /******** 从这里开始看，上面不要看 ************/

  console.log('含查询字符串的路径\n' + pathWithQuery)

  if(path === '/'){
      let string = fs.readFileSync('./index.html','utf8')
    //   var users=fs.readFileSync('./db/users','utf8')
    //   try{
    //       users=JSON.parse(users)
    //   }catch{
    //       users=[]
    //   }
    //   console.log(request.headers.cookie)
    ///////////////////////////////////////////////////////
    //   let cookies=''
    //   if(request.headers.cookie){
    //   cookies = request.headers.cookie.split('; ')  //把不同的用户分隔开['email=1@tsl.com','a=1','b=2']      
    //   }
    //   let hash ={}
    //   for(let i=0;i<cookies.length;i++){
    //       let parts=cookies[i].split('=')
    //       let key =parts[0]
    //       let value = parts[1]
    //       hash[key]=value
    //   }
      ///////////////////////////////////////
    //   console.log(hash)

    //   let mySession = sessions[hash.sessionId]
    let mySession = sessions[query.sessionId]   //查询参数
      let email
      if(mySession){
       email = mySession.sign_in_email 
      }

      let users = fs.readFileSync('./db/users','utf8')
      users=JSON.parse(users)
      let foundUser
      for(i=0;i<users.length;i++)
      {
          if(users[i].email===email){
            foundUser=users[i]
            break
          }
      }

      if(foundUser){
          string = string.replace('__password__',foundUser.password)
      }else{
        string = string.replace('__password__','不知道')
      }

    response.statusCode = 200
    response.setHeader('Content-Type', 'text/html;charset=utf-8')
    response.write(string)
    response.end()
  }else if(path==='/sign_up'&& method==='GET'){
    let string = fs.readFileSync('./sign_up.html','utf8')    
    response.statusCode = 200
    response.setHeader('Content-Type','text/html;charset=utf-8')    
    response.write(string)
    response.end()
  }
  else if(path==='/sign_up' && method==='POST'){
    readyBody(request).then((body)=>{
        // console.log(body)
        let hash={}
       let strings= body.split('&')  // ['email=1','password=2','password_confirmation=3']
        strings.forEach((string)=>{   //计数排序
            //string=['email=1']
            let parts=string.split('=')  //['email','1'],
            let key=parts[0]
            let value=parts[1]
            // hash[key]=value  //hash['email']='1'
            hash[key]=decodeURIComponent(value)
        })
        // console.log(hash)
        // let email=hash['email']
        // let password=hash['password']
        // let password_confirmation = hash['password_confirmation']
        let {email,password,password_confirmation}=hash  //es6语法
        // console.log(email)
        // console.log(email.indexOf('@'))
        if(email.indexOf('@')===-1){   //找不到@的话
        response.statusCode = 400  
        // response.write('email is bad')  
        response.setHeader('Content-Type','application/json;charset=utf-8')
        response.write(`{
            "errors":{
                "email":"invalid"
            }
        }`)   
        }else if(password!==password_confirmation){
            response.statusCode = 400  
            response.write('password not match')  
        }else{
            var users=fs.readFileSync('./db/users','utf8')
            try{
            users=JSON.parse(users)  //[]            
            }catch(exception){
                users=[]
            }
            let inUse= false
            for(let i=0;i<users.length;i++){
                let user =  users[i]
                if(user.email===email){
                    inUse=true  //已经有用户注册过了
                    break;
                }
            }
            if(inUse){
                response.statusCode = 400 
                response.write('email in use')  
            
            }
            else{
                users.push({email:email,password:password})   //是个对象
                var usersString =   JSON.stringify(users)
                fs.writeFileSync('./db/users',usersString)  //文件只能存字符串
                response.statusCode = 200
            }
            
            
        }
        response.end()
    },()=>{

    })
    

    // let body=[]
    // request.on('data',(chunk)=>{   //这个data是一小块数据
    //     body.push(chunk)
    // }).on('end',()=>{  //当push完了之后
    //     body=Buffer.concat(body).toString()
    //     console.log(body)
    //     response.statusCode = 200
    //     response.end()
    // })   
  }else if(path==='/sign_in' && method==='GET'){  //请求页面
    let string = fs.readFileSync('./sign_in.html','utf8')
    response.statusCode=200
    response.setHeader('Content-Type','text/html;charset=utf-8')
    response.write(string)
    response.end()
  }else if(path==='/sign_in' && method==='POST'){   //提交表单
    readyBody(request).then((body)=>{
        // console.log(body)
        let hash={}
       let strings= body.split('&')  // ['email=1','password=2']
        strings.forEach((string)=>{   //计数排序
            //string=['email=1']
            let parts=string.split('=')  //['email','1'],
            let key=parts[0]
            let value=parts[1]
            // hash[key]=value  //hash['email']='1'
            hash[key]=decodeURIComponent(value)
        })
        // console.log(hash)
        // let email=hash['email']
        // let password=hash['password']
        let {email,password}=hash  //es6语法   ,用户输入的数据存起来
        console.log(email)
        console.log(password)   
        var users = fs.readFileSync('./db/users','utf8')   //读取数据库里的数据
        try{
            users = JSON.parse(users)
        }catch(exception){
            users=[]
        }
        let found
        for(let i=0;i<users.length;i++){
            if(users[i].email===email && users[i].password===password){
                found=true
                break
            }           
        }
        if(found){
            let sessionId=Math.random()*100000  //随机数
            sessions[sessionId]={sign_in_email:email}
            // response.setHeader('Set-Cookie',`sign_in_email=${email};HttpOnly`)  //设置cookie
            // response.setHeader('Set-Cookie',`sessionId=${sessionId}`)
            response.write(`{"sessionId":${sessionId}}`)
            response.statusCode=200
        }else{
            response.statusCode=401
        }

    response.end()    
    })
  }
  else{
    response.statusCode = 404
    response.setHeader('Content-Type', 'text/html;charset=utf-8')
    response.write('呜呜呜')
    response.end()
  }

  /******** 代码结束，下面不要看 ************/
})

function readyBody(request){
    let body=[]
    return new Promise((resolve,reject)=>{
        request.on('data',(chunk)=>{
            body.push(chunk)
        }).on('end',()=>{
            body=Buffer.concat(body).toString()
            resolve(body)   //成功了就把body进行resolve出去
        })
    })
}

server.listen(port)
console.log('监听 ' + port + ' 成功\n http://localhost:' + port)
