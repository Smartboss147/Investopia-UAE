import fs from 'fs';

let content = fs.readFileSync('src/pages/admin/AdminOrdersPage.tsx', 'utf8');

const milestoneMap = `                  {selectedOrder.tracking.milestones.map((milestone, idx) => (
                    <div key={idx} className="bg-black/30 border border-white/5 rounded-xl p-4 flex items-center justify-between">
                      <div className="flex items-start gap-4">
                        <button 
                          onClick={() => handleToggleMilestone(selectedOrder.id, idx, milestone.completed)}
                          className={\`w-6 h-6 rounded-full flex items-center justify-center border mt-1 flex-shrink-0 transition-colors \${
                            milestone.completed ? 'bg-[#D4FF3D] border-[#D4FF3D] text-black' : 'border-gray-600 hover:border-white text-transparent'
                          }\`}
                        >
                          <CheckCircle2 size={16} />
                        </button>
                        <div>
                          <p className="font-bold text-white text-sm">{milestone.stage}</p>
                          <p className="text-gray-400 text-xs mb-1">{milestone.description}</p>
                          <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest flex items-center gap-1">
                            <MapPin size={10} /> {milestone.location}
                          </p>
                          
                          {milestone.stage === 'Customs Clearance' && (
                            <div className="mt-2 text-xs">
                              {milestone.customsPaid ? (
                                <span className="text-emerald-400 font-bold">Customs Fee Paid</span>
                              ) : (
                                <span className="text-yellow-500 font-bold">Pending Customs Payment ({formatCurrency(milestone.customsFee || 0, milestone.customsCurrency || 'USD')})</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}`;

const newMilestoneMap = `                  {selectedOrder.tracking.milestones.map((milestone, idx) => (
                    <div key={idx} className="bg-black/30 border border-white/5 rounded-xl p-4 flex flex-col gap-3">
                      <div className="flex items-start gap-4 justify-between w-full">
                        <div className="flex items-start gap-4">
                          <button 
                            onClick={() => handleToggleMilestone(selectedOrder.id, idx, milestone.completed)}
                            className={\`w-6 h-6 rounded-full flex items-center justify-center border mt-1 flex-shrink-0 transition-colors \${
                              milestone.completed ? 'bg-[#D4FF3D] border-[#D4FF3D] text-black' : 'border-gray-600 hover:border-white text-transparent'
                            }\`}
                          >
                            <CheckCircle2 size={16} />
                          </button>
                          <div className="flex-1">
                            <p className="font-bold text-white text-sm">{milestone.stage}</p>
                            <input 
                              id={\`ms-desc-\${idx}\`}
                              defaultValue={milestone.description}
                              className="w-full bg-transparent border-b border-white/10 text-gray-400 text-xs mb-1 focus:outline-none focus:border-[#D4FF3D] pb-1 mt-1"
                              placeholder="Description"
                            />
                            <div className="flex items-center gap-2 mt-2">
                              <MapPin size={10} className="text-gray-500" />
                              <input 
                                id={\`ms-loc-\${idx}\`}
                                defaultValue={milestone.location}
                                className="bg-transparent border-b border-white/10 text-gray-500 text-[10px] uppercase font-bold tracking-widest focus:outline-none focus:border-[#D4FF3D] w-32 pb-1"
                                placeholder="Location"
                              />
                              <input 
                                id={\`ms-date-\${idx}\`}
                                defaultValue={milestone.date}
                                className="bg-transparent border-b border-white/10 text-gray-500 text-[10px] uppercase font-bold tracking-widest focus:outline-none focus:border-[#D4FF3D] w-32 pb-1"
                                placeholder="Date (e.g. Sep 15, 2026)"
                              />
                            </div>
                            
                            {milestone.stage === 'Customs Clearance' && (
                              <div className="mt-3 text-xs flex items-center gap-2">
                                <label className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Customs/Clearance Fee:</label>
                                <input 
                                  id={\`ms-fee-\${idx}\`}
                                  type="number"
                                  defaultValue={milestone.customsFee || 0}
                                  className="bg-black/50 border border-white/10 rounded px-2 py-1 w-20 text-white focus:outline-none"
                                />
                                {milestone.customsPaid ? (
                                  <span className="text-emerald-400 font-bold ml-2">Paid</span>
                                ) : (
                                  <span className="text-yellow-500 font-bold ml-2">Pending</span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        <button 
                          onClick={async () => {
                            const desc = (document.getElementById(\`ms-desc-\${idx}\`) as HTMLInputElement).value;
                            const loc = (document.getElementById(\`ms-loc-\${idx}\`) as HTMLInputElement).value;
                            const date = (document.getElementById(\`ms-date-\${idx}\`) as HTMLInputElement).value;
                            
                            const newMilestones = [...selectedOrder.tracking!.milestones];
                            newMilestones[idx].description = desc;
                            newMilestones[idx].location = loc;
                            newMilestones[idx].date = date;
                            
                            if (milestone.stage === 'Customs Clearance') {
                              const fee = parseFloat((document.getElementById(\`ms-fee-\${idx}\`) as HTMLInputElement).value) || 0;
                              newMilestones[idx].customsFee = fee;
                            }

                            try {
                              const { doc, updateDoc } = await import('firebase/firestore');
                              const { db } = await import('../../lib/firebase');
                              await updateDoc(doc(db, 'tesla_orders', selectedOrder.id), {
                                'tracking.milestones': newMilestones
                              });
                              alert('Milestone updated successfully');
                            } catch (e) {
                              alert('Failed to update milestone');
                            }
                          }}
                          className="text-[#D4FF3D] hover:bg-[#D4FF3D]/10 p-2 rounded-lg transition-colors flex-shrink-0"
                          title="Save Milestone Changes"
                        >
                          <Save size={16} />
                        </button>
                      </div>
                    </div>
                  ))}`;

content = content.replace(milestoneMap, newMilestoneMap);
fs.writeFileSync('src/pages/admin/AdminOrdersPage.tsx', content);
console.log("Updated AdminOrdersPage Milestones");
