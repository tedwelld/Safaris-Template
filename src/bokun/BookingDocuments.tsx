import { useEffect, useState } from 'react';
import { bokun, downloadVoucher } from './api';

export function BookingDocuments({ checkoutId, verificationToken }: { checkoutId?: string; verificationToken?: string }) {
  const [documents, setDocuments] = useState<{ id: string; title: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState('');
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    const path = verificationToken ? '/lookup/documents' : `/cart/${checkoutId}/documents`;
    bokun<{ documents: { id: string; title: string }[] }>(path, undefined, 'GET', controller.signal, verificationToken)
      .then(data => setDocuments(data.documents)).catch(reason => { if (!controller.signal.aborted) setError(reason.message); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [checkoutId, verificationToken, retry]);
  async function download(id: string) {
    setDownloading(id); setError('');
    try { await downloadVoucher(checkoutId, id, verificationToken); }
    catch (reason) { setError((reason as Error).message); }
    finally { setDownloading(''); }
  }
  return <section className="bk-documents" aria-labelledby="booking-documents-heading"><h2 id="booking-documents-heading">Your tickets & vouchers.</h2>
    <p>Download your supplier’s PDF voucher for each confirmed activity. Keep it handy for your departure.</p>
    {loading ? <p role="status">Retrieving your vouchers…</p> : documents.length ? <div className="bk-document-list">{documents.map(document => <button className="secondary-btn" key={document.id} disabled={Boolean(downloading)} onClick={() => download(document.id)}><i className="pi pi-file-pdf" aria-hidden="true" /><span>{document.title}<small>{downloading === document.id ? 'Downloading…' : 'Download PDF voucher'}</small></span><i className="pi pi-download" aria-hidden="true" /></button>)}</div> : !error && <p role="status">Your supplier has not made vouchers available yet. Check again shortly or contact our team.</p>}
    {error && <p className="bk-error" role="alert">{error}</p>}
    <button className="text-link" disabled={loading || Boolean(downloading)} onClick={() => { setError(''); setLoading(true); setRetry(value => value + 1); }}>Refresh vouchers</button>
  </section>;
}
