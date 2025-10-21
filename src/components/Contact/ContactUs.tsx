import React from 'react'
import { AppHeader } from '../app-header'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Mail, Phone, MapPin, Clock, Send, MessageCircle, Users, Headphones } from 'lucide-react'
import Footer from '../shared/Footer'

export default function ContactUs() {
  const contactInfo = [
    {
      icon: <Mail className="w-6 h-6" />,
      title: "Email Us",
      details: "support@brainbridge.com",
      description: "We'll respond within 24 hours"
    },
    {
      icon: <Phone className="w-6 h-6" />,
      title: "Call Us",
      details: "+1 (555) 123-4567",
      description: "Mon-Fri from 8am to 6pm"
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      title: "Visit Us",
      details: "123 Education St, Learning City",
      description: "LC 12345, United States"
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Support Hours",
      details: "24/7 Online Support",
      description: "Live chat available anytime"
    }
  ]

  const faqs = [
    {
      question: "How do I get started with a course?",
      answer: "Simply browse our courses, select one that interests you, and click 'Enroll Now'. You'll get instant access to all course materials."
    },
    {
      question: "Can I get a refund if I'm not satisfied?",
      answer: "Yes! We offer a 30-day money-back guarantee for all courses. If you're not completely satisfied, we'll refund your payment."
    },
    {
      question: "Do you offer certificates upon completion?",
      answer: "Absolutely! All our courses come with a certificate of completion that you can share on LinkedIn and add to your resume."
    },
    {
      question: "How do I contact my instructor?",
      answer: "You can message your instructor directly through our platform, or join live Q&A sessions that most courses offer."
    }
  ]

  return (
    <>
      <AppHeader />
      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-blue-50 to-orange-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 sm:mb-16">
              <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-100 text-blue-600 rounded-full text-xs sm:text-sm font-medium mb-4">
                <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 fill-current" />
                Get in Touch
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
                We're Here to
                <br />
                <span className="text-blue-600">Help You</span>
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed px-4">
                Have questions about our courses? Need technical support? Want to become an instructor? 
                We're here to help you every step of the way.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Information */}
        <section className="py-12 sm:py-16 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {contactInfo.map((info, index) => (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow duration-300 border-0 bg-white">
                  <CardContent className="p-4 sm:p-6">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                      <div className="text-white">{info.icon}</div>
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">{info.title}</h3>
                    <p className="text-blue-600 font-medium mb-2 text-sm sm:text-base">{info.details}</p>
                    <p className="text-gray-600 text-xs sm:text-sm">{info.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Form & FAQ */}
        <section className="py-12 sm:py-16 lg:py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-12">
              {/* Contact Form */}
              <div className="order-2 lg:order-1">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">Send us a Message</h2>
                <Card className="border-0 bg-white shadow-lg">
                  <CardContent className="p-4 sm:p-6 lg:p-8">
                    <form className="space-y-4 sm:space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        <div>
                          <Label htmlFor="firstName" className="text-gray-700 font-medium text-sm sm:text-base">First Name</Label>
                          <Input 
                            id="firstName" 
                            type="text" 
                            placeholder="Enter your first name"
                            className="mt-2 border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base"
                          />
                        </div>
                        <div>
                          <Label htmlFor="lastName" className="text-gray-700 font-medium text-sm sm:text-base">Last Name</Label>
                          <Input 
                            id="lastName" 
                            type="text" 
                            placeholder="Enter your last name"
                            className="mt-2 border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="email" className="text-gray-700 font-medium text-sm sm:text-base">Email Address</Label>
                        <Input 
                          id="email" 
                          type="email" 
                          placeholder="Enter your email"
                          className="mt-2 border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="subject" className="text-gray-700 font-medium text-sm sm:text-base">Subject</Label>
                        <Input 
                          id="subject" 
                          type="text" 
                          placeholder="What's this about?"
                          className="mt-2 border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="message" className="text-gray-700 font-medium text-sm sm:text-base">Message</Label>
                        <textarea 
                          id="message" 
                          rows={4}
                          placeholder="Tell us how we can help you..."
                          className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm sm:text-base"
                        />
                      </div>
                      
                      <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 sm:py-3 text-sm sm:text-base">
                        <Send className="w-4 h-4 mr-2" />
                        Send Message
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>

              {/* FAQ Section */}
              <div className="order-1 lg:order-2">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">Frequently Asked Questions</h2>
                <div className="space-y-3 sm:space-y-4">
                  {faqs.map((faq, index) => (
                    <Card key={index} className="border-0 bg-white shadow-sm hover:shadow-md transition-shadow duration-300">
                      <CardHeader className="pb-2 sm:pb-3">
                        <CardTitle className="text-base sm:text-lg text-gray-900">{faq.question}</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{faq.answer}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                {/* Additional Help */}
                <Card className="mt-6 sm:mt-8 border-0 bg-gradient-to-r from-blue-50 to-orange-50">
                  <CardContent className="p-4 sm:p-6 text-center">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-blue-500 to-orange-500 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                      <Headphones className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Need Immediate Help?</h3>
                    <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">Our support team is available 24/7 to assist you.</p>
                    <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white text-sm sm:text-base">
                      <Users className="w-4 h-4 mr-2" />
                      Start Live Chat
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  )
}
