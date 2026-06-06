'use client'

import { ClipboardEvent, KeyboardEvent, useRef, useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AuthHeader } from '@/components/auth/auth-header'
import { AuthPasswordLayout } from '@/components/auth/auth-password-layout'
import { useVerifyCodeMutation, useForgotPasswordMutation } from '@/store/api/auth-api'

function VerifyCodeFormInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const email = searchParams.get('email') || ''

  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const [verifyCode, { isLoading: isVerifying }] = useVerifyCodeMutation()
  const [resendCode, { isLoading: isResending }] = useForgotPasswordMutation()

  useEffect(() => {
    if (!email) {
      router.replace('/forgot-password')
    }
  }, [email, router])

  const handleChange = (index: number, value: string) => {
    const numericValue = value.replace(/[^0-9]/g, '')

    if (numericValue.length > 1) {
      const digits = numericValue.slice(0, 6).split('')
      const newCode = [...code]
      digits.forEach((digit, i) => {
        if (index + i < 6) {
          newCode[index + i] = digit
        }
      })
      setCode(newCode)
      const nextIndex = Math.min(index + digits.length, 5)
      inputRefs.current[nextIndex]?.focus()
    } else if (numericValue) {
      const newCode = [...code]
      newCode[index] = numericValue
      setCode(newCode)
      if (index < 5) {
        inputRefs.current[index + 1]?.focus()
      }
    }
    if (error) setError('')
  }

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault()
      const newCode = [...code]
      if (code[index]) {
        newCode[index] = ''
        setCode(newCode)
      } else if (index > 0) {
        newCode[index - 1] = ''
        setCode(newCode)
        inputRefs.current[index - 1]?.focus()
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text')
    const digits = pastedData.replace(/[^0-9]/g, '').slice(0, 6).split('')
    const newCode = [...code]
    digits.forEach((digit, i) => {
      if (i < 6) newCode[i] = digit
    })
    setCode(newCode)
    const nextEmptyIndex = newCode.findIndex(c => !c)
    const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex
    inputRefs.current[focusIndex]?.focus()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = code.join('');

    if (fullCode.length !== 6) {
      setError('Veuillez entrer le code complet');
      return;
    }

    try {
      const response = await verifyCode({ email, code: fullCode }).unwrap();
      const resetToken = response.resetToken;

      if (resetToken) {
        router.push(`/reset-password?email=${encodeURIComponent(email)}&token=${resetToken}`);
      } else {
        console.log("Token missing in API response");
        setError("Une erreur est survenue. Veuillez réessayer.");
      }  
    } catch (err: any) {
      setError(err.data?.message || 'Le code est invalide ou a expiré');
    }
  };

  const handleResendCode = async () => {
    try {
      setError('')
      await resendCode(email).unwrap()
      setCode(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    } catch (err) {
      setError('Erreur lors du renvoi du code')
    }
  }

  return (
    <>
      <AuthHeader 
        title='Vérification'
        subtitle={`Veuillez taper le code reçu à l'adresse: ${email}`}
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex justify-center sm:gap-3 gap-2">
          {code.map((digit, index) => (
            <input
              key={index}
              ref={el => { inputRefs.current[index] = el }}
              type="text"
              inputMode="numeric"
              placeholder='*'
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              disabled={isVerifying}
              className={`sm:w-12 sm:h-12 w-10 h-10 text-center text-xl font-semibold border ${
                  error ? 'border-red-500' : 'border-gray-300'
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all disabled:bg-gray-50`}
              aria-label={`Code digit ${index + 1}`}
            />
          ))}
        </div>

        {error && (
          <p className="text-red-500 text-xs text-center font-medium">{error}</p>
        )}

        <button
          type="submit"
          disabled={isVerifying || code.join('').length !== 6}
          className="w-full bg-primary disabled:bg-gray-300 text-white font-medium py-3 rounded-lg transition-colors duration-200"
        >
          {isVerifying ? 'Vérification...' : 'Valider code'}
        </button>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Code non reçu ?{' '}
            <button
              type="button"
              onClick={handleResendCode}
              disabled={isResending}
              className="text-cyan-500 hover:text-cyan-600 font-medium disabled:text-gray-400"
            >
              {isResending ? 'Envoi...' : 'Renvoyer code'}
            </button>
          </p>
        </div>
      </form>
    </>
  )
}

export default function VerifyCodePage() {
  return (
    <AuthPasswordLayout>
      <Suspense fallback={
        <div className="flex items-center justify-center p-10">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary"></div>
        </div>
      }>
        <VerifyCodeFormInner />
      </Suspense>
    </AuthPasswordLayout>
  )
}