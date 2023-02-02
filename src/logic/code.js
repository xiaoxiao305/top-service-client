let messages={
	0:"默认失败错误码",
	1:"成功",
	2:"账号重复",
}
export default{
	Fail:0,
	OK:1,
	Repeated:2,
	Message(id){return messages[id]}
}