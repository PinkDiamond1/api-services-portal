import {
  Controller,
  Request,
  Put,
  Path,
  Route,
  Security,
  Body,
  OperationId,
} from 'tsoa';
import { KeystoneService } from './ioc/keystoneInjector';
import { inject, injectable } from 'tsyringe';
import { syncRecords } from '../batch/feed-worker';
import express from 'express';
import multer from 'multer';

@injectable()
@Route('/namespaces/{ns}/contents')
@Security('jwt', ['Content.Publish'])
export class ContentController extends Controller {
  private keystone: KeystoneService;
  constructor(@inject('KeystoneService') private _keystone: KeystoneService) {
    super();
    this.keystone = _keystone;
  }

  @Put()
  public async putContent(
    @Path() ns: string,
    @Request() request: any
  ): Promise<any> {
    return await syncRecords(
      this.keystone.createContext(request),
      'ContentBySlug',
      request.body['id'],
      request.body
    );
  }

  @Put('{contentId}/markdown')
  public async putMarkdown(
    @Path() ns: string,
    @Path() contentId: string,
    @Request() request: any
  ): Promise<any> {
    await this.handleFile(request);
    return await syncRecords(
      this.keystone.createContext(request),
      'ContentBySlug',
      contentId,
      { content: request.file.buffer.toString() }
    );
  }

  @Put('{contentId}/markdownv2')
  public async putMarkdownV2(
    @Path() ns: string,
    @Path() contentId: string,
    @Body() body: any,
    @Request() request: any
  ): Promise<any> {
    await this.handleFile(request);
    return await syncRecords(
      this.keystone.createContext(request),
      'ContentBySlug',
      contentId,
      { content: body.toString() }
    );
  }

  private handleFile(request: express.Request): Promise<any> {
    const multerSingle = multer().single('content');
    return new Promise((resolve, reject) => {
      multerSingle(request, undefined, async (error: any) => {
        if (error) {
          reject(error);
        }
        resolve(null);
      });
    });
  }
}
