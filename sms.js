import { sms } from 'tencentcloud-sdk-nodejs';

// if (!process.versions?.bun) (await import('dotenv')).config();
// if (!process.env['TENCENT_CLOUD_SECRET_ID']) throw new Error('environment variable TENCENT_CLOUD_SECRET_ID is not set');
// if (!process.env['TENCENT_CLOUD_SECRET_KEY']) throw new Error('environment variable TENCENT_CLOUD_SECRET_KEY is not set');
// if (!process.env['TENCENT_CLOUD_SMS_REGION']) throw new Error('environment variable TENCENT_CLOUD_SMS_REGION is not set');
// if (!process.env['TENCENT_CLOUD_SMS_SDK_APP_ID']) throw new Error('environment variable TENCENT_CLOUD_SMS_SDK_APP_ID is not set');

/* 实例化要请求产品(以sms为例)的client对象 */
const client = new sms.v20210111.Client({
  credential: {
    secretId: process.env['TENCENT_CLOUD_SECRET_ID'],
    secretKey: process.env['TENCENT_CLOUD_SECRET_KEY'],
  },
  region: process.env['TENCENT_CLOUD_SMS_REGION'],
  profile: {
    /* SDK默认用TC3-HMAC-SHA256进行签名，非必要请不要修改这个字段 */
    signMethod: 'HmacSHA256',
    httpProfile: {
      reqMethod: 'POST', // 请求方法
      reqTimeout: 10, // 请求超时时间，默认60s
      /**
       * 指定接入地域域名，默认就近地域接入域名为 sms.tencentcloudapi.com ，也支持指定地域域名访问，例如广州地域的域名为 sms.ap-guangzhou.tencentcloudapi.com
       */
      endpoint: 'sms.tencentcloudapi.com',
    },
  },
});

/* 请求参数，根据调用的接口和实际情况，可以进一步设置请求参数
 * 属性可能是基本类型，也可能引用了另一个数据结构
 * 推荐使用IDE进行开发，可以方便的跳转查阅各个接口和数据结构的文档说明 */

/* 帮助链接：
 * 短信控制台: https://console.cloud.tencent.com/smsv2
 * 腾讯云短信小助手: https://cloud.tencent.com/document/product/382/3773#.E6.8A.80.E6.9C.AF.E4.BA.A4.E6.B5.81 */
const params = {
  /* 短信应用ID: 短信SdkAppId在 [短信控制台] 添加应用后生成的实际SdkAppId，示例如1400006666 */
  // 应用 ID 可前往 [短信控制台](https://console.cloud.tencent.com/smsv2/app-manage) 查看
  SmsSdkAppId: process.env['tencent_cloud_sms_sdk_app_id'],
  /* 短信签名内容: 使用 UTF-8 编码，必须填写已审核通过的签名 */
  // 签名信息可前往 [国内短信](https://console.cloud.tencent.com/smsv2/csms-sign) 或 [国际/港澳台短信](https://console.cloud.tencent.com/smsv2/isms-sign) 的签名管理查看
  SignName: '腾讯云',
  /* 模板 ID: 必须填写已审核通过的模板 ID */
  // 模板 ID 可前往 [国内短信](https://console.cloud.tencent.com/smsv2/csms-template) 或 [国际/港澳台短信](https://console.cloud.tencent.com/smsv2/isms-template) 的正文模板管理查看
  TemplateId: '449739',
  /* 模板参数: 模板参数的个数需要与 TemplateId 对应模板的变量个数保持一致，若无模板参数，则设置为空 */
  TemplateParamSet: ['1234'],
  /* 下发手机号码，采用 e.164 标准，+[国家或地区码][手机号]
   * 示例如：+8613711112222， 其中前面有一个+号 ，86为国家码，13711112222为手机号，最多不要超过200个手机号*/
  PhoneNumberSet: ['+8613711112222'],
};
// 通过client对象调用想要访问的接口，需要传入请求对象以及响应回调函数
const send = async (phone_numbers) => {
  await client.SendSms({
    ...params,
    PhoneNumberSet: [...phone_numbers], // 替换为实际的手机号码
    TemplateParamSet: ['1234'],
  });
};

export default { send };
