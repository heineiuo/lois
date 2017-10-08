const formidable = require("formidable")

const defaultState = {}

const requestReducer = (state = defaultState, action) => {
  return state
}

const upload = query => (dispatch, getState) => new Promise(async (resolve, reject) => {
  try {
    const { request: req, response: res } = getState()
    /**
     *  uploadKey: the key in formData, default is 'file'
     **/
    const { uploadKey = 'file' } = query

    /**
     * 设置上传参数, 处理上传, 返回上传结果 {fields, files}
     */
    const uploaded = await new Promise((resolve, reject) => {
      const form = new formidable.IncomingForm()
      form.encoding = 'utf8'
      form.hash = 'md5'
      form.keepExtensions = true
      form.multiples = true

      form.parse(req, (err, fields, files) => {
        if (err) return reject(err)
        resolve({ fields, files })
      })
    })

    /**
     * 移动文件
     */
    const filesFile = uploaded.files[uploadKey]
    if (!filesFile) {
      const error = new Error('Upload fail')
      error.name = 'ServerError'
      return reject(filesFile)
    }
    const fileList = filesFile.length > 0 ? filesFile : [filesFile]

    resolve({ fileList })

  } catch (e) {
    reject(e)
  }
})



module.exports = module.exports.default = {
  requestReducer,
  upload
}

