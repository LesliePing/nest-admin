import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Authorize } from '../core/decorators/authorize.decorator';
import { captchaDto, ImageCaptchaDto, LoginInfoDto } from './login.dto';
import { captchaCode, ImageCaptcha, LoginToken } from './login.class';
import { LoginService } from './login.service';
import { LogDisabled } from '../core/decorators/log-disabled.decorator';
import { UtilService } from 'src/shared/services/util.service';

@ApiTags('登录模块')
@Controller()
export class LoginController {
  constructor(private loginService: LoginService, private utils: UtilService) {}

  @ApiOperation({
    summary: '获取登录图片验证码',
  })
  @ApiOkResponse({ type: ImageCaptcha })
  @Get('captcha/img')
  @Authorize()
  async captchaByImg(@Query() dto: ImageCaptchaDto): Promise<ImageCaptcha> {
    return await this.loginService.createImageCaptcha(dto);
  }

  @ApiOperation({
    summary: '获取缓存验证码',
  })
  @ApiOkResponse({ type: captchaCode })
  @Post('rediscode')
  @Authorize()
  async getCaptcha(@Body() dto: captchaDto): Promise<any> {
    console.log('dto :>>', JSON.stringify(dto));
    return this.loginService.getCaptchaCode(dto);
  }

  @ApiOperation({
    summary: '管理员登录',
  })
  @ApiOkResponse({ type: LoginToken })
  @Post('login')
  @LogDisabled()
  @Authorize()
  async login(
    @Body() dto: LoginInfoDto,
    @Req() req: FastifyRequest,
    @Headers('user-agent') ua: string,
  ): Promise<LoginToken> {
    await this.loginService.checkImgCaptcha(dto.captchaId, dto.verifyCode);
    const token = await this.loginService.getLoginSign(
      dto.username,
      dto.password,
      this.utils.getReqIP(req),
      ua,
    );
    return { token };
  }
}
