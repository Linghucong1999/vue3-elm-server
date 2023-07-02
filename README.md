# vue3-elm-server
基于Node.js的web框架Express.js，数据库使用Mongodb开发的一款web服务器

[厨生鲜后台管理系统](https://github.com/Linghucong1999/Vue3-CXSH)

## 文档后续项目写完会逐渐完善
每次 **commit** 我都会说明具体哪里改动，那里完善都会做详细的说明，所以目前只能先这样，开发时间太短，时间太赶了。

## 用户上传图片后端修改历程
最初版是使用  [gm](https://www.npmjs.com/package/gm),毕竟 gm 的处理图片人家也是专业的，本着这个原则，结果 &#x1F494; First download and install [GraphicsMagick](http://www.graphicsmagick.org/) or [ImageMagick](https://imagemagick.org/script/download.php)。
我想着直接npm一下，下载这两个处理器，再配置 gm。结果发现，人家 要在配置本地环境&#x26C4;

我放弃了使用 [gm](https://www.npmjs.com/package/gm)，结果很好，我在社区里发现了 [sharp](https://www.npmjs.com/package/sharp)，也是处理图片的；
引用官方的说法：<font color=red size=4 face="微软雅黑">The typical use case for this high speed Node.js module is to convert large images in common formats to smaller, web-friendly JPEG, PNG, WebP, GIF and AVIF images of varying dimensions.</font>

**最最重要的**<font color=red size=4 face="微软雅黑">不需要安装其他处理器</font>
```shell
npm i sharp --save
```
直接开箱使用，&#x1F349;舒服；

## 用户上传图片处理中
因为sharp是需要两个目录处理图片，然后我这边也是需要使用了 `fs.rename` 去修改用户上传图片的名称，原始代码如下：
```JavaScript
fs.rename(files.file.filepath, repath, (err) => {
                        if (err) throw new Error(err);
         });
const newRepath = './public/img/' + fullName;
shrap(repath)
    .resize(200, 200, { fit: sharp.fit.inside })
    .toFile(newRepath, (err, info) => {
            if (err) {
                    fs.unlinkSync(repath);
                    reject(err);
                    console.log(err);
            } else {
                    fs.unlinkSync(repath);
                    resolve(fullName);
                    };
    })
```
就会出现时不时的报错，说目录位置找不到什么的，我就奇怪为什么目录文件会找不到。找了好一会，发现，好像 `fs.rename` 是异步的&#x1F4A1;
```JavaScript
fs.rename(files.file.filepath, repath, (err) => {
                        if (err) throw new Error(err);
                        const newRepath = './public/img/' + fullName;
                        shrap(repath)
                            .resize(200, 200, { fit: sharp.fit.inside })
                            .toFile(newRepath, (err, info) => {
                                if (err) {
                                    fs.unlinkSync(repath);
                                    reject(err);
                                    console.log(err);
                                } else {
                                    fs.unlinkSync(repath);
                                    resolve(fullName);
                                };
                            })
                    });
```