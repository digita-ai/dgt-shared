// import { async } from '@angular/core/testing';
// import { By } from '@angular/platform-browser';
// import { DGTTestRunnerComponent } from '@digita-ai/dgt-shared-test';
// import { DGTBrowserTimelineEventSummaryComponent } from './timeline-event-summary.component';

// describe('DGTBrowserTimelineEventSummaryComponent', () => {
//     let hostElement: HTMLElement;
//     const testService = new DGTTestRunnerComponent<DGTBrowserTimelineEventSummaryComponent>(configuration);
//     testService.setup(DGTBrowserTimelineEventSummaryComponent);

//     const events = [{...eventJustNow}];

//     beforeEach(() => {
//         testService.component.events = events;
//         hostElement = testService.fixture.nativeElement;
//     });

//     it('should create', async(() => {
//         expect(testService.component).toBeTruthy();
//     }));

//     // test disabled because feedback button is disabled
//     // describe('eventFeedback Emitter Tests', () => {
//     //     it('should emit eventFeedback when the button is clicked', async(() => {
//     //         spyOn(testService.component.eventFeedback, 'emit');

//     //         const element: HTMLElement = hostElement.querySelector('#flag');
//     //         element.click();

//     //         testService.fixture.whenStable().then(() => {
//     //             expect(testService.component.eventFeedback.emit).toHaveBeenCalledWith(events);
//     //         });
//     //     }));
//     //     it('should emit eventFeedback when onEventFeedback() is called', async(() => {
//     //         spyOn(testService.component.eventFeedback, 'emit');
//     //         testService.component.onEventFeedback(events);
//     //         expect(testService.component.eventFeedback.emit).toHaveBeenCalledWith(events);
//     //     }));
//     // });

//     describe('eventRemoved Emitter Tests', () => {
//         it('should emit eventRemoved when onEventRemoved() is called', async(() => {
//             spyOn(testService.component.eventRemoved, 'emit');
//             testService.component.onEventRemoved(events);
//             expect(testService.component.eventRemoved.emit).toHaveBeenCalledWith(events);
//         }));
//     });

//     describe('MatMenu opens', () => {
//         it('should open when clicked on dots', async(() => {
//             // open the menu
//             const dots: HTMLElement = hostElement.querySelector('#dots');
//             dots.click();
//             testService.fixture.detectChanges();

//             // test disabled because feedback button is disabled
//             // const menu = hostElement.parentNode.querySelector('#report');
//             // expect(menu).not.toBeNull();

//             const menu = hostElement.parentNode.querySelector('#remove');
//             expect(menu).not.toBeNull();
//         }));
//         it('MatMenu not visible when not clicked', async(() => {
//             const menu = hostElement.parentNode.querySelector('#remove');
//             expect(menu).toBeNull();

//             // test disabled because feedback button is disabled
//             // const menu = hostElement.parentNode.querySelector('#remove');
//             // expect(menu).toBeNull();
//         }));

//     });
//     describe('MatMenu functionality', () => {
//         // test disabled because feedback button is disabled
//         // it('should emit eventFeedback when clicked on report button', async( () => {

//         //     // open the matmenu
//         //     const dots: HTMLElement = hostElement.querySelector('#dots');
//         //     dots.click();
//         //     testService.fixture.detectChanges()
//         //     // click the report button and spy
//         //     spyOn(testService.component.eventFeedback, 'emit');
//         //     const report = testService.fixture.debugElement.query(By.css('#report'));
//         //     report.triggerEventHandler('click', events);

//         //     testService.fixture.whenStable().then(() => {
//         //         expect(testService.component.eventFeedback.emit).toHaveBeenCalledWith(events);
//         //     });
//         // }));

//         it('should emit eventRemoved when clicked on remove button', async(() => {
//             // open the matmenu
//             const dots: HTMLElement = hostElement.querySelector('#dots');
//             dots.click();
//             testService.fixture.detectChanges();
//             // click the remove button and spy
//             spyOn(testService.component.eventRemoved, 'emit');
//             const remove = testService.fixture.debugElement.query(By.css('#remove'));
//             remove.triggerEventHandler('click', events);

//             testService.fixture.whenStable().then(() => {
//                 expect(testService.component.eventRemoved.emit).toHaveBeenCalledWith(events);
//             });
//         }));
//     });
// });
