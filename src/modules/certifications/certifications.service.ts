import { CertificationsRepository } from './certifications.repository.js';
import { NotFoundError } from '../../utils/errors.js';
import crypto from 'crypto';

interface Dependencies {
  certificationsRepository: CertificationsRepository;
}

export class CertificationsService {
  private certificationsRepository: CertificationsRepository;

  constructor({ certificationsRepository }: Dependencies) {
    this.certificationsRepository = certificationsRepository;
  }

  async getUserCertificates(userId: string) {
    return this.certificationsRepository.findByUserId(userId);
  }

  async verifyCertificate(credentialId: string) {
    const cert = await this.certificationsRepository.findByCredentialId(credentialId);
    if (!cert) {
      throw new NotFoundError('Certificate with the given credential ID was not found');
    }
    return cert;
  }

  async issueCertificate(userId: string, courseId: string, title: string) {
    const credentialId = `CERT-${crypto.randomBytes(8).toString('hex').toUpperCase()}`;
    const pdfUrl = `https://perfect-score-assets.s3.amazonaws.com/certificates/${credentialId}.pdf`;

    return this.certificationsRepository.create(userId, courseId, title, credentialId, pdfUrl);
  }
}
