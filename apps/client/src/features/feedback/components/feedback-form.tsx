"use client"
import { Form, FormControl, FormField, FormItem, FormLabel } from '@roro-ai/ui/components/ui/form'
import React from 'react'
import { useForm } from 'react-hook-form'
import { FeedbackFormSchema, FeedbackFormValues } from '../zod/feedback-from-schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardContent, CardHeader, CardTitle } from '@roro-ai/ui/components/ui/card'
import { RadioGroup } from '@roro-ai/ui/components/ui/radio-group'
import FeedbackTypeOption from './feedback-type-option'
import { HelpCircle, ThumbsDown, ThumbsUp } from 'lucide-react'
import { Input } from '@roro-ai/ui/components/ui/input';
import { Textarea } from '@roro-ai/ui/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@roro-ai/ui/components/ui/select';
import { Button } from '@roro-ai/ui/components/ui/button'
import { FaPaperPlane } from 'react-icons/fa'

export default function FeedbackForm() {
    const feedbackForm = useForm<FeedbackFormValues>({
        mode: "onBlur",
        resolver: zodResolver(FeedbackFormSchema),
        defaultValues: {
            feedbackType: 'Suggestion',
            subject: '',
            details: '',
            issue: undefined
        }
    })

    const feedbackType = feedbackForm.watch("feedbackType");

    const feedbackSubmitFormHandler = async (values: FeedbackFormValues) => {
       console.log(values)
    }

  return (
    <Form {...feedbackForm}>
        <form onSubmit={feedbackForm.handleSubmit(feedbackSubmitFormHandler)} className='space-y-6'>
              <FormField 
               control={feedbackForm.control}
               name='feedbackType'
               render={({ field }) => (
                <Card className='p-4'>
                <FormItem>
                    <FormLabel>
                        <CardHeader>
                          <CardTitle>
                             What type of feedback do you have?
                          </CardTitle>
                        </CardHeader>
                    </FormLabel>
                    <FormControl>
                    <CardContent>
                    <RadioGroup
                      value={field.value}
                      onValueChange={field.onChange}
                      className='grid grid-cols-1 md:grid-cols-3 gap-3'
                    >
                      <FeedbackTypeOption
                        id="suggestion"
                        value='Suggestion'
                        icon={<ThumbsUp className="h-5 w-5" />}
                        label="Suggestion"
                        description="Share ideas for improvement"
                       />
                       <FeedbackTypeOption
                         id="issue"
                         value='Issue'
                         icon={<ThumbsDown className="h-5 w-5" />}
                         label="Issue"
                         description="Report something that's not working"
                       />
                       <FeedbackTypeOption
                         id="question"
                         value= "Question"
                         icon={<HelpCircle className="h-5 w-5" />}
                         label="Question"
                         description="Ask about how something works"
                       />
                    </RadioGroup>
                    </CardContent>
                    </FormControl>
                </FormItem>
                </Card>
               )}
              />
              <Card>
              <CardContent className="p-5 text-base">
              <FormField 
                control={feedbackForm.control}
                name='subject'
                render={({ field } ) => (
                  <FormItem className='mb-4'>
                    <FormLabel>
                      Subject
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder='Brief description of your feedback'
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              {feedbackType === "Issue" && (
                <FormField 
                  control={feedbackForm.control}
                  name='issue'
                  render={({ field }) => (
                    <FormItem className='mb-4'>
                      <FormLabel>
                        <h3 className='text-base'>
                          Issue
                        </h3>
                      </FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                         <FormControl>
                           <SelectTrigger>
                             <SelectValue placeholder="Select an Issue Category" />
                           </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="User Interface">User Interface</SelectItem>
                        <SelectItem value="Performance">Performance</SelectItem>
                        <SelectItem value="Bug">Bug</SelectItem>
                        <SelectItem value="Account">Account</SelectItem>
                        <SelectItem value='Others'>Others</SelectItem>
                      </SelectContent>
              </Select>
                    </FormItem>
                  )}
                />
              )}
              <FormField 
                control={feedbackForm.control}
                name='details'
                render={({ field } ) => (
                  <FormItem className='mb-4'>
                    <FormLabel>
                      Details
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='Describe your feedback in detail here'
                        className='resize-none overflow-y-scroll overflow-hidden h-20'
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              </CardContent>
            </Card>
            <Button className='text-white'>
              <FaPaperPlane />
              Submit Feedback
            </Button>
        </form>
    </Form>
  )
}
