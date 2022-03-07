class HostedMeetingsController < ApplicationController
  before_action :set_hosted_meeting, only: %i[ show edit update destroy ]
  before_action :set_business_unit
  before_action :set_meeting

  layout :set_layout


  def set_layout
    if params[:action] == 'index'
      'application'
    else
      'hosted_meetings'
    end
  end

  # GET /hosted_meetings or /hosted_meetings.json
  def index
    @hosted_meetings = HostedMeeting.all
  end

  # GET /hosted_meetings/1 or /hosted_meetings/1.json
  def show

    @agendas = @hosted_meeting.agenda['items']
    @duration = @hosted_meeting.agenda['items'].map{|s| s['duration_minutes']}.inject(:+)
    @current_agenda_item = {}
    @next_agenda_item = {}
    count = 0

    any_started_agenda_items = @agendas.select{|x| x['started_at']}.present?
    unless any_started_agenda_items
      @current_agenda_item = {'id': -1, 'name': 'Meeting Gathering', 'duration_minutes': 0}.as_json
    end


    @agendas.reject{|x| x['ended_at'].present?}.each do |s| 
      if s[:started_at].blank?
        count += 1 

        if count <= 2 
          if  @current_agenda_item.blank?
            @current_agenda_item = s
          else
            if @next_agenda_item.blank?
              @next_agenda_item = s
            end
          end

          # if count == 1 and any_started_agenda_items
          #   @current_agenda_item = s
          # else
          #   @next_agenda_item = s
          # end                      
        
        
        
        end
        
      end 
    end 

    @next_agenda_item['id'] = -1 if @next_agenda_item.blank?
    if @current_agenda_item.present? and @current_agenda_item['started_at'].present?
      @next_start_time = Time.parse(@current_agenda_item['started_at']) + @current_agenda_item['duration_minutes'].minutes
    end

  end

  # GET /hosted_meetings/new
  def new
    @hosted_meeting = HostedMeeting.new
  end

  # GET /hosted_meetings/1/edit
  def edit
  end

  # POST /hosted_meetings or /hosted_meetings.json
  def create
    start_time = Time.new
    @hosted_meeting = HostedMeeting.new(hosted_meeting_params)
    @hosted_meeting.user = current_user
    @hosted_meeting.started_at = start_time
    @agenda_instance = @meeting.agendas.active.as_json
    # @agenda_instance.first['started_at'] = start_time
    @hosted_meeting.agenda = {items: @agenda_instance}
  
    respond_to do |format|
      if @hosted_meeting.save
        format.html { redirect_to business_unit_meeting_hosted_meeting_url(@business_unit, @meeting, @hosted_meeting), notice: "Hosted meeting was successfully started." }
        format.json { render :show, status: :created, location: @hosted_meeting }
      else
        format.html { render :new, status: :unprocessable_entity }
        format.json { render json: @hosted_meeting.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /hosted_meetings/1 or /hosted_meetings/1.json
  def update
    respond_to do |format|
      if @hosted_meeting.update(hosted_meeting_params)
        format.html { redirect_to hosted_meeting_url(@hosted_meeting), notice: "Hosted meeting was successfully updated." }
        format.json { render :show, status: :ok, location: @hosted_meeting }
      else
        format.html { render :edit, status: :unprocessable_entity }
        format.json { render json: @hosted_meeting.errors, status: :unprocessable_entity }
      end
    end
  end

  def finish
    @hosted_meeting = HostedMeeting.find(params[:hosted_meeting_id])
    @hosted_meeting.ended_at = Time.new
    respond_to do |format|
      if @hosted_meeting.save
        format.html { redirect_to business_unit_meeting_url(@business_unit, @meeting), notice: "Hosted meeting was ended." }
      else
        format.html { render :edit, status: :unprocessable_entity }
      end
    end
  end
  def finish_agenda
    action_time = Time.new
    @hosted_meeting = HostedMeeting.find(params[:hosted_meeting_id])
    @current_agenda_id = params[:current_agenda_id].to_i
    @next_agenda_id = params[:next_agenda_id].to_i
    unless @current_agenda_id == -1
      @hosted_meeting.agenda['items'].select{|s| s['id'] == @current_agenda_id}.first['ended_at'] = action_time if @current_agenda_id.present?
    end
    if @next_agenda_id != -1
      @hosted_meeting.agenda['items'].select{|s| s['id'] == @next_agenda_id}.first['started_at'] = action_time if @next_agenda_id.present?
    end
    respond_to do |format|
      if @hosted_meeting.save
        format.html { redirect_to business_unit_meeting_hosted_meeting_url(@business_unit, @meeting, @hosted_meeting), notice: "Agenda Item completed." }
      else
        format.html { render :edit, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /hosted_meetings/1 or /hosted_meetings/1.json
  def destroy
    @hosted_meeting.destroy

    respond_to do |format|
      format.html { redirect_to hosted_meetings_url, notice: "Hosted meeting was successfully destroyed." }
      format.json { head :no_content }
    end
  end

  private

  def set_meeting
    @meeting = Meeting.find(params[:meeting_id])
  end
  def set_business_unit
    @business_unit = BusinessUnit.find(params[:business_unit_id])
  end

    # Use callbacks to share common setup or constraints between actions.
    def set_hosted_meeting
      @hosted_meeting = HostedMeeting.find(params[:id])
    end

    # Only allow a list of trusted parameters through.
    def hosted_meeting_params
      params.permit(:meeting_id, :started_at, :ended_at, :started_by, :agenda, :slides)
    end
end
