import { Context } from 'hono';
import { CertificationsService } from './certifications.service.js';

interface Dependencies {
  certificationsService: CertificationsService;
}

export class CertificationsController {
  private certificationsService: CertificationsService;

  constructor({ certificationsService }: Dependencies) {
    this.certificationsService = certificationsService;
  }

  listMy = async (c: Context) => {
    const user = c.get('user');
    const certs = await this.certificationsService.getUserCertificates(user!.id);
    return c.json({ data: certs });
  };

  verify = async (c: Context) => {
    const body = c.get('body');
    const cert = await this.certificationsService.verifyCertificate(body.credentialId);
    return c.json({ data: cert });
  };
}
