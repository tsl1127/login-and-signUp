var http = require('http')
var fs = require('fs')
var url = require('url')
var port = process.argv[2]

if(!port){
  console.log('请指定端口号好不啦？\nnode server.js 8888 这样不会吗？')
  process.exit(1)
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
    response.statusCode = 200
    response.setHeader('Content-Type', 'text/html;charset=utf-8')
    response.write('string')
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
            hash[key]=value  //hash['email']='1'
        })
        // console.log(hash)
        // let email=hash['email']
        // let password=hash['password']
        // let password_confirmation = hash['password_confirmation']
        let {email,password,password_confirmation}=hash  //es6语法
        if(email.indexOf('@')===-1){   //找不到@的话
        response.statusCode = 400  
        // response.write('email is bad')  
        response.write(`{
            "errors":{
                "email":"invalid"
            }
        }`)   
        }else if(password!==password_confirmation){
            response.statusCode = 400  
            response.write('password not match')  
        }else{
         response.statusCode = 200
        
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
