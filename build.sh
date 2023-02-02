npm run build

sleep 1

hosts=( [42]='123.60.159.42' )
user="root"
while getopts "u:" arg #选项后面的冒号表示该选项需要参数
do
    case $arg in
         u)
            host=${hosts[$OPTARG]}
            if [ "$host" == "" ];then
              echo "要上传的服务器不在列表中"
              exit 2
            fi
            scp -r ./dist/* $user@$host:~/www/test.itsmtop.com/
            ;;
         ?)  #当有不认识的选项的时候arg为?
        echo "参数错误"
    exit 1
    ;;
    esac
done
